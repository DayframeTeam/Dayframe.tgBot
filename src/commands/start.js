import { Markup } from 'telegraf';

export default async function startCommand(ctx) {
  const keyboard = Markup.keyboard(
    [
      ['🕸️ Обзор графа', '📅 Задачи сегодня'],
      ['⏳ Времени осталось', '🔜 Ближайшая задача'],
    ],
    {
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  );

  await ctx.reply('Привет! 👋 Что делаем?', keyboard);
}
