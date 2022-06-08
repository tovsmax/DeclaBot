import path from "path"
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import fs from "fs";

let queryFileId = null

export default (pageUrl) => {
  const TOKEN = "5329580924:AAFsd2Itl-F4PDxgOOLtwkGNzCbTst1CvH0"
  const bot = new TelegramBot(TOKEN, {polling: true})

  // bot.setChatMenuButton({
  //   menu_button: {
  //     type: "web_app",
  //     text: "kekos",
  //     web_app: {
  //       url: pageUrl,
  //     }
  //   }
  // })

  bot.on('photo', msg => {
    queryFileId = msg.photo[msg.photo.length - 1].file_id
    bot.sendMessage(msg.chat.id, "Хотите сохранить фотку?", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Сохранить',
              callback_data: 'savePhoto'
            },
            {
              text: 'Отменить',
              callback_data: 'denyPhoto'
            }
          ]
        ]
      }
    })
  })

  bot.on('callback_query', query => {
    if (queryFileId === null) return

    switch (query.data) {
      case 'savePhoto':
        bot.downloadFile(queryFileId, 'uploads')
        bot.sendMessage(query.message.chat.id, 'Сохранено')
        queryFileId = null
        break;
      case 'denyPhoto':
        bot.sendMessage(query.message.chat.id, 'Охрана, отмена')
        queryFileId = null
        break;
      default:
        console.log('Error query')
    }
  })
}