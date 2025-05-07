import { Markup } from 'telegraf';

export default async function startCommand(ctx) {
  const t = ctx.i18n;

  const kb = Markup.keyboard(
    [
      [t.menu.next, t.menu.today],
      [t.menu.time, t.menu.graph],
      [t.menu.allCommands],
    ],
    { resize_keyboard: true },
  );

  await ctx.reply(t.greeting, kb);
}
