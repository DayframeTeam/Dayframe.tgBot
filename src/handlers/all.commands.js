export default async function allCommandsHandler(ctx) {
  const lines = [
    `/start — ${ctx.i18n.commands.start}`,
    `/find — ${ctx.i18n.commands.find.prompt}`,
  ];

  await ctx.reply(lines.join('\n'));
}
