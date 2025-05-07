import 'dotenv/config';
import { Telegraf } from 'telegraf';

import { i18nMiddleware } from './utils/i18n.js';
import startCommand from './commands/start.js';
import todayTasksHandler from './handlers/today.tasks.js';
import graphHandler from './handlers/graph.js';
import nextTaskHandler from './handlers/next.task.js';
import timeLeftHandler from './handlers/timeLeft.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Подключаем только i18n-мидлвару
bot.use(i18nMiddleware());

// /start
bot.command('start', startCommand);

// Реагируем на переведённые тексты кнопок
bot.hears((txt, ctx) => txt === ctx.i18n.menu.next, nextTaskHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.today, todayTasksHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.time, timeLeftHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.graph, graphHandler);

bot.launch();
