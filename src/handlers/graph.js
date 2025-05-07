import axios from 'axios';
import { sendAnimatedDots } from '../utils/botHelpers.js';
import 'dotenv/config';

export default async function graphHandler(ctx) {
  // Запускаем dots и получаем функцию для удаления
  const removeDots = await sendAnimatedDots(ctx, 300);

  // Выполняем основную работу
  const resultText = await fetchGraphAndFormat(ctx);

  // Удаляем dots сразу после получения результата
  await removeDots();

  // Отправляем результат
  await ctx.reply(resultText, { parse_mode: 'Markdown' });
}

async function fetchGraphAndFormat(ctx) {
  try {
    // пробуем получить до 100 самых «близких» к пустому запросу
    const { data } = await axios.get(
      `${process.env.INDEXER_URL}/search_text`,
      {
        params: {
          chat_id: String(ctx.from.id),
          text: '',
          top_k: 100,
        },
      },
    );
    // допустим, ваш API отдает { matches: [ { id, text, score }, … ] }
    const matches = data.matches || data; // подстрахуемся на случай, если возвращается сразу массив

    if (!Array.isArray(matches) || matches.length === 0) {
      return '⚠️ В индексированной БД пока нет записей.';
    }

    // Формируем текст ответа
    const lines = matches.map((item, idx) => {
      const txt = item.text ?? item.metadata?.text ?? `<no-text>`;
      const id = item.id;
      const score =
        item.score != null ? ` (score ${item.score.toFixed(4)})` : '';
      return `${idx + 1}. [${id}] ${txt}${score}`;
    });

    // Если много — можно разобить на несколько сообщений,
    // но для простоты здесь одно
    return ['🕸️ Содержимое вашей vector-БД:', ...lines].join('\n');
  } catch (err) {
    console.error('Ошибка при fetch /search_text:', err);
    return '❌ Не удалось получить записи из векторной БД.';
  }
}
