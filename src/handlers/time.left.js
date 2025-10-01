import axios from 'axios';
import { sendAnimatedDots } from '../utils/botHelpers.js';
import 'dotenv/config';
import { sanitizeInput } from '../utils/htmlUtils.js';

const API_BASE = process.env.SERVER_URL || 'http://localhost:3000';

// "HH:mm" → минуты от 00:00
function hmToMinutes(hm) {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

// минуты → "X ч Y м"
function formatMins(total) {
  const sign = total < 0 ? '-' : '';
  const mins = Math.abs(total);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${sign}${h} ч ${m} м`;
}

export default async function timeLeftHandler(ctx) {
  const removeDots = await sendAnimatedDots(ctx, 300);

  try {
    // 1) Забираем все задачи на сегодня
    const chatId = ctx.from.id;
    const { data } = await axios.get(`${API_BASE}/bot/today/${chatId}`);
    const { tasks = [], templates = [] } = data;

    // 2) Объединяем, фильтруем только те, у которых есть и start, и end
    const items = [
      ...tasks.map((t) => ({ ...t, __isTemplate: false })),
      ...templates.map((t) => ({ ...t, __isTemplate: true })),
    ];
    const timedItems = items.filter((i) => i.start_time && i.end_time);

    // 3) Текущее время HH:mm по зоне мск (или можно вставить user.timezone) TODO::
    const now = new Date();
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    const currentHM = moscowTime.toLocaleTimeString('ru-RU', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const nowMin = hmToMinutes(currentHM);

    // 4) Считаем занятое время (в минутах)
    let usedMins = 0;
    for (const it of timedItems) {
      const startMin = hmToMinutes(it.start_time.slice(0, 5));
      const endMin = hmToMinutes(it.end_time.slice(0, 5));
      if (endMin <= nowMin) {
        // полностью прошла → пропускаем
        continue;
      } else if (startMin <= nowMin && nowMin < endMin) {
        // сейчас в процессе
        usedMins += endMin - nowMin;
      } else if (startMin > nowMin) {
        // ещё впереди
        usedMins += endMin - startMin;
      }
    }

    // 5) Минут до полуночи по московскому времени
    const moscowTomorrow = new Date(moscowTime);
    moscowTomorrow.setHours(24, 0, 0, 0);
    const minsToMidnight = Math.floor((moscowTomorrow - moscowTime) / 60000);

    // 6) Свободное время
    const freeMins = minsToMidnight - usedMins;
    const formatted = formatMins(freeMins);

    // 7) Строим короткий ответ
    // Если получилось отрицательное — всё равно показываем с минусом
    const lines = [];
    lines.push(`<b>${ctx.i18n.timeLeft.result}</b> ${sanitizeInput(formatted)}`);
    lines.push(`<i>${ctx.i18n.timeLeft.note}</i>`);

    await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
  } catch (err) {
    console.error('❌ timeLeftHandler error', err);
    await ctx.reply(ctx.i18n.timeLeft.error);
  } finally {
    await removeDots();
  }
}
