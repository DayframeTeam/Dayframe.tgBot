import 'dotenv/config';
import { Telegraf } from 'telegraf';

import { i18nMiddleware } from './utils/i18n.js';
import startCommand from './commands/start.js';
import todayTasksHandler from './handlers/today.tasks.js';
import graphHandler from './handlers/graph.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Подключаем только i18n-мидлвару
bot.use(i18nMiddleware());

// /start
bot.command('start', startCommand);

// Реагируем на переведённые тексты кнопок
// bot.hears((txt, ctx) => txt === ctx.i18n.menu.next, scheduleHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.today, todayTasksHandler);
// bot.hears((txt, ctx) => txt === ctx.i18n.menu.time, scheduleHandler);
bot.hears((txt, ctx) => txt === ctx.i18n.menu.graph, graphHandler);

bot.launch();
