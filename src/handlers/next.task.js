import axios from 'axios';
import { sendAnimatedDots } from '../utils/botHelpers.js';
import 'dotenv/config';
import { getPriorityEmoji } from '../utils/priority.js';
import { sortByPriority } from '../utils/sort.js';
import { sanitizeInput } from '../utils/htmlUtils.js';

const API_BASE = process.env.SERVER_URL || 'http://localhost:3000';

export default async function nextTaskHandler(ctx) {
  // 1) Анимация «точек…»
  const removeDots = await sendAnimatedDots(ctx, 300);

  try {
    // 2) Запрашиваем у API все задачи на сегодня
    const chatId = ctx.from.id;
    const { data } = await axios.get(`${API_BASE}/bot/today/${chatId}`);
    let { tasks = [], templates = [] } = data;

    // 3) Объединяем задачи
    const items = [
      ...tasks.map((t) => ({ ...t, __isTemplate: false })),
      ...templates.map((t) => ({ ...t, __isTemplate: true })),
    ];
    // Оставляем только невыполненные юзер-задачи + все шаблоны
    const pending = items.filter((i) => i.__isTemplate || !i.is_done);

    // 4) Разбиваем на с временем и без
    const timed = pending
      .filter((i) => i.start_time)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    const withoutTime = pending.filter((i) => !i.start_time);

    // 5) Узнаём текущее HH:MM
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentHM = `${hh}:${mm}`;

    // 6) Пропущенные и грядущие
    const missed = timed.filter((i) => i.start_time < currentHM);
    const upcoming = timed.filter((i) => i.start_time >= currentHM);
    // Следующая только из грядущих
    const next = upcoming[0] || null;

    const lines = [];

    // 7) Раздел «Пропущено задач» если есть
    if (missed.length > 0) {
      lines.push(`<b>${ctx.i18n.nextTask.missed} ${missed.length}</b>`);
      missed.forEach((i) => {
        const timeLabel = `<code>${i.start_time.slice(0, 5)}</code> `;
        const colorMark = getPriorityEmoji(i.priority);
        let title = sanitizeInput(i.title);
        if (!i.__isTemplate && i.is_done) title = `<s>${title}</s>`;
        lines.push(`${colorMark} ${timeLabel}${title}`);
      });
      lines.push('');
    }

    // 8) Раздел «Следующая задача:»
    lines.push(`<b>${ctx.i18n.nextTask.nextHeader}</b>`);
    if (next) {
      const timeLabel = `<code>${next.start_time.slice(0, 5)}</code> `;
      const colorMark = getPriorityEmoji(next.priority);
      let title = sanitizeInput(next.title);
      if (!next.__isTemplate && next.is_done) title = `<s>${title}</s>`;
      lines.push(`${colorMark} ${timeLabel}${title}`);
    } else {
      lines.push(ctx.i18n.nextTask.noTimed);
    }
    lines.push(''); // разделитель

    // 9) Раздел «Задачи без времени»
    if (withoutTime.length > 0) {
      lines.push(`<b>${ctx.i18n.nextTask.withoutTime} ${withoutTime.length}</b>`);

      // 9.1) Сортируем сами задачи по приоритету
      const sortedNoTime = sortByPriority(withoutTime);

      // 9.2) Рендерим их списком
      sortedNoTime.forEach((i) => {
        let title = sanitizeInput(i.title || ctx.i18n.nextTask.noTitle);
        if (!i.__isTemplate && i.is_done) {
          title = `<s>${title}</s>`;
        }
        const colorMark = getPriorityEmoji(i.priority);
        lines.push(`${colorMark} ${title}`);
      });
    }

    // 10) Отправляем сообщение в HTML
    await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
  } catch (err) {
    console.error('❌ nextTaskHandler error:', err);
    await ctx.reply(ctx.i18n.nextTask.error);
  } finally {
    await removeDots();
  }
}
