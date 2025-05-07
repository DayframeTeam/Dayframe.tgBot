export default async function allCommandsHandler(ctx) {
  const lines = [`/start — ${ctx.i18n.commands.start}`];

  await ctx.reply(lines.join('\n'));
}
