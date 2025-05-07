/**
 * Отправляет сообщение, ждёт `delay` мс, а потом удаляет его.
 * @param {TelegrafContext} ctx — контекст Telegraf
 * @param {string} text — текст для отправки
 * @param {object} [replyOpts] — опции для ctx.reply()
 * @param {number} [delay=5000] — сколько мс ждать перед удалением
 */
async function sendAndDelete(ctx, text, replyOpts = {}, delay = 5000) {
  const msg = await ctx.reply(text, replyOpts);
  setTimeout(() => {
    ctx.deleteMessage(msg.message_id).catch(() => {
      /* silent */
    });
  }, delay);
}

/**
 * Оборачивает async-операцию, периодически отправляя в чат action="typing",
 * чтобы пользователь видел, что бот «думает».
 *
 * @param {TelegrafContext} ctx — контекст Telegraf
 * @param {(ctx: TelegrafContext) => Promise<any>} fn — ваша async-функция (например, хендлер)
 * @param {number} [intervalMs=4000] — интервал между sendChatAction
 * @returns {Promise<any>} результат fn
 */
async function withTyping(ctx, fn, intervalMs = 4000) {
  const chatId = ctx.chat.id;

  // сразу одна индикация
  await ctx.telegram.sendChatAction(chatId, 'upload_photo').catch((err) => {
    console.error('Error sending initial typing action:', err);
  });

  // и периодически
  const timer = setInterval(() => {
    ctx.telegram.sendChatAction(chatId, 'upload_photo').catch((err) => {
      console.error('Error sending periodic typing action:', err);
    });
  }, intervalMs);

  try {
    const result = await fn(ctx);
    return result;
  } finally {
    clearInterval(timer);
  }
}

/**
 * Отправляет анимированное сообщение с точками (от 3 до 5), обновляет его и удаляет через delay мс.
 * @param {TelegrafContext} ctx
 * @param {number} [interval=400] — интервал между сменой точек
 */
async function sendAnimatedDots(ctx, interval = 400) {
  let dots = 3;
  let direction = 1;
  let isActive = true;
  const getDots = () => '•'.repeat(dots);
  const msg = await ctx.reply(getDots());

  const timer = setInterval(async () => {
    if (!isActive) return;
    dots += direction;
    if (dots === 5 || dots === 3) direction *= -1;
    try {
      await ctx.telegram.editMessageText(
        msg.chat.id,
        msg.message_id,
        undefined,
        getDots(),
      );
    } catch (e) {
      // ignore edit errors
    }
  }, interval);

  // Возвращаем функцию для удаления dots
  return async () => {
    isActive = false;
    clearInterval(timer);
    try {
      await ctx.deleteMessage(msg.message_id);
    } catch (e) {
      // ignore delete errors
    }
  };
}

export { sendAndDelete, withTyping, sendAnimatedDots };
