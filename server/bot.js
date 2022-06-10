import TelegramBot from "node-telegram-bot-api";
import FiniteStateMachineBot from "./finiteStateMachineBot.js";
import { botChats } from "./database.js";

const TOKEN = "5329580924:AAFsd2Itl-F4PDxgOOLtwkGNzCbTst1CvH0"

export default function createBot(pageUrl) {
  // bot.setChatMenuButton({
  //   menu_button: {
  //     type: "web_app",
  //     text: "kekos",
  //     web_app: {
  //       url: pageUrl,
  //     }
  //   }
  // })
  
  const TelBot = new TelegramBot(TOKEN, {polling: true})
  let fsmBot
  if (botOptions) {
    fsmBot = new FiniteStateMachineBot(TelBot, botOptions)
    fsmBot.start(msg.chat.id)
  }


  TelBot.onText(/\/start/, msg => {
    const chatId = msg.chat.id
    let botOptions = botChats.find(botChat => botChat.chatId == chatId)
    if (!botOptions) {
      botOptions = {
        chatId: chatId
      }
      botChats.push(botOptions)
      fsmBot = new FiniteStateMachineBot(TelBot, botOptions)
      fsmBot.start(msg.chat.id)
    }
  })

  TelBot.on('photo', msg => {
    if (fsmBot.checkState('pendingPhoto')) {
      const queryFileId = msg.photo[msg.photo.length - 1].file_id
      fsmBot.ask(msg.chat.id, queryFileId)
    }
  })

  TelBot.on('callback_query', query => {
    if (fsmBot.checkState('pendingAnswer')) {
      fsmBot.savePhoto(query.message.chat.id, query.data)
      TelBot.editMessageReplyMarkup(null, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      })
      TelBot.deleteMessage(query.message.chat.id, query.message.message_id)
    }
  })
}