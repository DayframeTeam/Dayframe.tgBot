import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Эмуляция __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Абсолютный путь к папке с JSON-файлами
const localesDir = resolve(__dirname, '../locales');

// Загружаем переводы
const LOCALES = {};
for (const file of fs.readdirSync(localesDir)) {
  if (file.endsWith('.json')) {
    const code = file.replace(/\.json$/, '');
    LOCALES[code] = JSON.parse(
      fs.readFileSync(resolve(localesDir, file), 'utf-8'),
    );
  }
}

export function i18nMiddleware() {
  return (ctx, next) => {
    // Только по коду из Telegram, без сессий:
    const lang = ctx.from?.language_code?.slice(0, 2) || 'en';
    ctx.i18n = LOCALES[lang] || LOCALES['en'];
    return next();
  };
}
