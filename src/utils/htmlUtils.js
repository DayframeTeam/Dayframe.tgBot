/**
 * Экранирует строку для безопасной вставки в Telegram-сообщение с parse_mode='HTML'
 * Заменяет &, < и > на HTML-сущности.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
