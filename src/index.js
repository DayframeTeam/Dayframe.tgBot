import 'dotenv/config';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  await ctx.reply('Привет! Нажми на меню для Web App.');
});

bot.on('text', async (ctx) => {
  await ctx.reply(`Вы написали: ${ctx.message.text}`);
});

bot.launch();
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());