import TelegramBot from "node-telegram-bot-api";

/** @typedef {('none'|'pendingPhoto'|'pendingAnswer')} State */

/**
 * Часть Declabot, связання с конечными автоматами
 */
export default class finiteStateMachineBot {
  /**
   * 
   * @param {TelegramBot} TelBot 
   */
  constructor(TelBot) {
    /** @type {State} */
    this.curState = "none"
    this.savePhotoId = null
    this.TelBot = TelBot
  }

  /**
   * Проверить, соответствует ли переданное состояние текущему состоянию бота
   * @param {State} state 
   */
  checkState(state) {
    if (this.curState === state) {
      return true
    }
    return false
  }

  /**
   * 
   * @param {Number} chatId 
   */
  start(chatId) {
    this.curState = "pendingPhoto"
    this.TelBot.sendMessage(chatId, "Жду фоток")
  }

  /**
   * 
   * @param {Number} chatId
   * @param {String} photoId 
   */
  ask(chatId, photoId) {
    this.savePhotoId = photoId
    
    this.TelBot.sendMessage(chatId, "Хотите сохранить фотку?", {
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

    this.curState = "pendingAnswer"
  }

  /**
   * 
   * @param {Number} chatId
   * @param {'savePhoto'|'denyPhoto'} answer 
   */
  savePhoto(chatId, answer) {
    if (answer == 'savePhoto') {
      this.TelBot.downloadFile(this.savePhotoId, 'uploads')
      this.TelBot.sendMessage(chatId, 'Сохранено')
    } else if (answer == 'denyPhoto') {
      this.TelBot.sendMessage(chatId, 'Охрана, отмена')
    } else {
      this.TelBot.sendMessage()
    }

    this.savePhotoId = null
    this.curState = "pendingPhoto"
  }
}