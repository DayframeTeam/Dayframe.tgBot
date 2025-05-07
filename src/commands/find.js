import 'dotenv/config';

export default async function findCommand(ctx) {
  // 1) Спрашиваем фразу
  await ctx.reply(ctx.i18n.commands.find.prompt);
  // 2) Ставим флаг в сессии
  ctx.session.awaitingFind = true;
}
