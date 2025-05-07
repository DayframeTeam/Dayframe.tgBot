export default async function findHandler(ctx) {
  // 1) Спрашиваем фразу
  await ctx.reply(ctx.i18n.menu.find.prompt);
  // 2) Ставим флаг в сессии
  ctx.session.awaitingFind = true;
}
