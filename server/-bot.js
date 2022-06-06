import telegraf, { Telegraf, Telegram } from "telegraf"

export default function (token, pageUrl) {
  const bot = new Telegraf(token)

  bot.start((ctx) => {
    ctx.telegram.getMe().then((data) => {
      ctx.reply(data)
    })

    const MenuButtonWebApp = {
      type: "web_app",
      text: "My web page",
      web_app: {
        url: pageUrl,
      },
    }
    ctx.setChatMenuButton(MenuButtonWebApp)
  })

  bot.launch()

  return bot
}
