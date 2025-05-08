/**
 * Удаляет все HTML-теги, в том числе <script>…</script>
 */
function stripTags(str = '') {
  return (
    String(str)
      // убираем «скрипты»
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // убираем любые другие теги
      .replace(/<\/?[^>]+(>|$)/g, '')
  );
}

/**
 * Экранирует &, <, >, " и '
 * для безопасной вставки в HTML с parse_mode='HTML'
 */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Экранирует обратные слэши и кавычки
 * для базовой защиты при вставке в SQL-строку.
 * Но **настоятельно** рекомендую вместо этого
 * всегда пользоваться параметризованными запросами!
 */
function escapeSql(str = '') {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

/**
 * Полная «очистка» пользовательского ввода:
 * 1) Убираем теги
 * 2) Экранируем для HTML
 * 3) Экранируем для SQL (если вдруг строите строку)
 *
 * @param {string} input любая сырая строка от пользователя
 * @returns {string} безопасная строка для HTML & SQL
 */
export function sanitizeInput(input) {
  const noTags = stripTags(input);
  const htmlSafe = escapeHtml(noTags);
  const sqlSafe = escapeSql(htmlSafe);
  return sqlSafe;
}
