export default async function allCommandsHandler(ctx) {
  const lines = [
    `/start — ${ctx.i18n.commands.start}`,
    `/graph — ${ctx.i18n.commands.graph}`,
  ];

  await ctx.reply(lines.join('\n'));
}
