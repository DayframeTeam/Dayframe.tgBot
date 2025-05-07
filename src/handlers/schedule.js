import axios from 'axios';
import { sendAnimatedDots } from '../utils/botHelpers.js';
import 'dotenv/config';

const API_BASE = process.env.SERVER_URL || 'http://localhost:3000';

export default async function scheduleHandler(ctx) {
    // Запускаем dots и получаем функцию для удаления
    const removeDots = await sendAnimatedDots(ctx, 300);

    // Выполняем основную работу
    const resultText = await fetchTasks(ctx);
  
    // Удаляем dots сразу после получения результата
    await removeDots();
  
    // Отправляем результат
    await ctx.reply(resultText, { parse_mode: 'Markdown' });
 
}

async function fetchTasks(ctx) {
  const chatId = ctx.from.id;
  const apiUrl = `${API_BASE}/bot/today/${chatId}`;

  // Указываем Telegram что бот «печатает…»
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  try {
    const res = await axios.get(apiUrl);
    const { tasks = [], templates = [], dateString } = res.data;

    // Если нет ни пользовательских, ни шаблонных задач
    if (tasks.length === 0 && templates.length === 0) {
      return `📅 У вас нет задач на сегодня (${dateString}).`;
    }

    // Собираем текст ответа
    let text = [`📅 Задачи на *${dateString}*:`, ''];

    if (tasks.length) {
      text.push('📝 *Ваши задачи:*');
      tasks.forEach((t, i) => {
        const doneMark = t.is_done ? '✅' : '';
        text.push(`${i + 1}. ${t.title} ${doneMark}`);
      });
      text.push('');
    }

    if (templates.length) {
      text.push('📋 *Шаблонные задачи:*');
      templates.forEach((t, i) => {
        text.push(`${i + 1}. ${t.title}`);
      });
    }

    // Отправляем одной Markdown-разметкой
    return text.join('\n');
  } catch (err) {
    console.error('❌ scheduleHandler error:', err);
    return '❌ Не удалось получить задачи на сегодня. Попробуйте позже.';
  }
}