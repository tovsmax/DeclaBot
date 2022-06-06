import TelegramBot from "node-telegram-bot-api";

export default function(pageUrl) {
  const token = "5329580924:AAFsd2Itl-F4PDxgOOLtwkGNzCbTst1CvH0"
  const bot = new TelegramBot(token, {polling: true})

  bot.setChatMenuButton({
    menu_button: {
      type: "web_app",
      text: "kekos",
      web_app: {
        url: pageUrl,
      }
    }
  })
}