import 'dotenv/config';
import { Telegraf, session } from 'telegraf';

import { i18nMiddleware } from './utils/i18n.js';
import startCommand from './commands/start.js';
import todayTasksHandler from './handlers/today.tasks.js';
import nextTaskHandler from './handlers/next.task.js';
import timeLeftHandler from './handlers/time.left.js';
import allCommandsHandler from './handlers/all.commands.js';
import { sanitizeInput } from './utils/htmlUtils.js';

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

// Подключаем только i18n-мидлвару
bot.use(i18nMiddleware());

bot.use((ctx, next) => {
  // Гарантируем, что ctx.session всегда объект
  if (!ctx.session) ctx.session = {};
  return next();
});

// /start
bot.command('start', startCommand);

// Реагируем на переведённые тексты кнопок
bot.hears((txt, ctx) => txt === ctx.i18n.menu.next, nextTaskHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.today, todayTasksHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.time, timeLeftHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.allCommands, allCommandsHandler);

bot.on('message', async (ctx) => {
  // если есть текст и это не команда которую мы не обрабатываем
  await ctx.reply('Временно не работает');
});

bot.launch();
