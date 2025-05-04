import 'dotenv/config';
import { Telegraf } from 'telegraf';
import startCommand from './commands/start.js';
import scheduleHandler from './handlers/schedule.js';
import graphHandler from './handlers/graph.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.command('start', startCommand);

// по тексту кнопки вызываем соответствующий хендлер
bot.hears('🔜 Ближайшая задача', scheduleHandler);
bot.hears('📅 Задачи сегодня', scheduleHandler);
bot.hears('⏳ Времени осталось', scheduleHandler);
bot.hears('🕸️ Обзор графа', graphHandler);

bot.launch();
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
