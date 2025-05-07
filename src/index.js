import 'dotenv/config';
import { Telegraf, session } from 'telegraf';

import { i18nMiddleware } from './utils/i18n.js';
import startCommand from './commands/start.js';
import todayTasksHandler from './handlers/today.tasks.js';
import graphHandler from './handlers/graph.js';
import nextTaskHandler from './handlers/next.task.js';
import timeLeftHandler from './handlers/timeLeft.js';
import allCommandsHandler from './handlers/all.commands.js';
import findCommand from './commands/find.js';
import axios from 'axios';
import { escapeHtml } from './utils/htmlUtils.js';
import { sendAndDelete } from './utils/botHelpers.js';

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

// Подключаем только i18n-мидлвару
bot.use(i18nMiddleware());

bot.use((ctx, next) => {
  // Гарантируем, что ctx.session всегда объект
  if (!ctx.session) ctx.session = {};

  // Если ждем от пользователя поисковый запрос
  if (ctx.session.awaitingFind && ctx.message?.text) {
    ctx.session.awaitingFind = false;
    const query = ctx.message.text;

    (async () => {
      // Сигналим «ищем…»
      await ctx.reply(ctx.i18n.commands.find.searching);

      try {
        const { data } = await axios.get(
          `${process.env.INDEXER_URL}/search_text`,
          {
            params: {
              chat_id: String(ctx.from.id),
              text: query,
              top_k: 10,
            },
          },
        );

        const matches = data.matches || [];
        if (matches.length === 0) {
          return ctx.reply(ctx.i18n.commands.find.noResults);
        }

        // Выводим результаты по одному
        for (const m of matches) {
          const text = escapeHtml(m.metadata?.text || '');
          if (!text) continue;
          await ctx.replyWithHTML(`<b>Text:</b> ${text}`);
        }
      } catch (err) {
        console.error(err);
        await ctx.reply(ctx.i18n.commands.find.error);
      }
    })();

    // Не идем дальше по другим хендлерам
    return;
  }

  return next();
});

// /start
bot.command('start', startCommand);
// /find
bot.command('find', findCommand);

// Реагируем на переведённые тексты кнопок
bot.hears((txt, ctx) => txt === ctx.i18n.menu.next, nextTaskHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.today, todayTasksHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.time, timeLeftHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.graph, graphHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.allCommands, allCommandsHandler);

bot.on('message', async (ctx) => {
  const msg = ctx.message;
  // если есть текст и это не команда (начинается с '/')
  if (msg.text && !msg.text.startsWith('/')) {
    try {
      // POST /add_text? или body JSON в зависимости от API
      const base = process.env.INDEXER_URL.replace(/\/+$/, '');
      await axios.post(
        `${base}/add_text`,
        {
          chat_id: String(ctx.from.id),
          text: msg.text,
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
      await sendAndDelete(ctx, ctx.i18n.commands.store.added);
    } catch (err) {
      console.error('❌ Save text error', err);
      await sendAndDelete(ctx, ctx.i18n.commands.store.error);
    }
  } else {
    // всё, что не plain text
    await sendAndDelete(ctx, ctx.i18n.commands.store.unsupported);
  }
});

bot.launch();
