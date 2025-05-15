import { sendAnimatedDots } from '../utils/botHelpers.js';

export default async function clearAllCommand(ctx) {
  // Запускаем dots и получаем функцию для удаления
  const removeDots = await sendAnimatedDots(ctx, 300);

  // Выполняем основную работу
  const resultText = await clearAll(ctx);

  // Удаляем dots сразу после получения результата
  await removeDots();

  // Отправляем результат
  await ctx.reply(resultText, { parse_mode: 'Markdown' });
}

async function clearAll(ctx) {
  const chatId = ctx.from.id;
  const { data } = await axios.delete(
    `${process.env.INDEXER_URL}/clear_namespace/${chatId}`,
  );
  if (data.success) {
    return ctx.i18n.commands.clearAll.success;
  }
  return ctx.i18n.commands.clearAll.error;
}
