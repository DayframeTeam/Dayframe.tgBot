import axios from 'axios';
import { sendAnimatedDots } from '../utils/botHelpers.js';
import 'dotenv/config';
import { getPriorityEmoji } from '../utils/priority.js';
import { escapeHtml } from '../utils/htmlUtils.js';

const API_BASE = process.env.SERVER_URL || 'http://localhost:3000';

export default async function todayTasksHandler(ctx) {
  // 1) Показыем анимацию точек…
  const removeDots = await sendAnimatedDots(ctx, 300);

  // 2) Соберём задачи
  const resultText = await fetchTasks(ctx);

  // 3) Уберём точки и ответим
  await removeDots();
  await ctx.reply(resultText, { parse_mode: 'HTML' });
}

async function fetchTasks(ctx) {
  const chatId = ctx.from.id;
  let tasks = [];
  let templates = [];
  let dateString = '';
  try {
    const { data } = await axios.get(`${API_BASE}/bot/today/${chatId}`);
    ({ tasks = [], templates = [], dateString } = data);

  } catch (error) {
    console.error('❌ Fetch tasks error', error);
    return ctx.i18n.todayTasks.error;
  }
  // 1) Переворачиваем дату из YYYY.MM.DD или YYYY-MM-DD → DD.MM.YYYY
  let displayDate = dateString;
  const m = dateString.match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);
  if (m) {
    const [, y, mon, d] = m;
    displayDate = `${d}.${mon}.${y}`;
  }

  // 2) Собираем единый массив, помечая шаблоны
  const items = [
    ...tasks.map((t) => ({ ...t, __isTemplate: false })),
    ...templates.map((t) => ({ ...t, __isTemplate: true })),
  ];

  // 3) Сортируем: сначала по start_time, потом без времени
  const withTime = items
    .filter((i) => i.start_time)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const withoutTime = items.filter((i) => !i.start_time);
  const sorted = [...withTime, ...withoutTime];

  if (!sorted.length) {
    return ctx.i18n.todayTasks.noTasks;
  }

  // 4) Формируем текст
  const lines = [];
  lines.push(`<b>${ctx.i18n.todayTasks.header} ${displayDate}</b>`);
  lines.push('');

  sorted.forEach((it, idx) => {
    let timeLabel = '';
    if (it.start_time) {
      const start = it.start_time.slice(0, 5);
      if (it.end_time) {
        const end = it.end_time.slice(0, 5);
        timeLabel = `${start}–${end} `;
      } else {
        timeLabel = `${start} `;
      }
    }

    const colorMark = getPriorityEmoji(it.priority);

    const expMark = it.exp && it.exp > 0 ? ` ⚡+${it.exp}` : '';

    // оборачиваем вместе время + текст
    let label = `${timeLabel}${escapeHtml(it.title)}`;
    if (!it.__isTemplate && it.is_done) {
      label = `<s>${label}</s>`;
    }

    lines.push(`${colorMark} ${label}${expMark}`);
  });

  return lines.join('\n');
}
