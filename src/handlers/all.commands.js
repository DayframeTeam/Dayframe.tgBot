export default async function allCommandsHandler(ctx) {
  const lines = [
    `/start — ${ctx.i18n.commands.start}`,
    `/graph — ${ctx.i18n.commands.graph}`,
    `/clearAll — ${ctx.i18n.commands.clearAll.command}`,
  ];

  await ctx.reply(lines.join('\n'));
}
