import TelegramBot from "node-telegram-bot-api";
import { botChats } from "./database";

/** @typedef {('none'|'pendingPhoto'|'pendingAnswer')} State */

/**
 * Часть Declabot, связання с конечными автоматами
 */
export default class FiniteStateMachineBot {
  /**
   * 
   * @param {TelegramBot} TelBot 
   * @param {import("./database").BotChat} options
   */
  constructor(TelBot, options) {
    this.TelBot = TelBot
    this.chatId = chatId

    /** @type {State} */
    this.curState = options.curState || "none"
    this.savePhotoId = options.savePhotoId || null
  }

  /** @param {State} state */
  set curState(state) {
    this.curState = state
    botChats[this.chatId] = state
  }

  /** @param {string} savePhotoId */
  set savePhotoId(photoId) {
    this.savePhotoId = photoId
    botChats[this.savePhotoId] = photoId
  }

  /**
   * Проверка соответствия текущему состоянию бота
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
   * @param {number} chatId 
   */
  start(chatId) {
    this.curState = "pendingPhoto"
    this.TelBot.sendMessage(chatId, "Жду фоток")
  }

  /**
   * 
   * @param {number} chatId
   * @param {string} photoId 
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
   * @param {number} chatId
   * @param {'savePhoto'|'denyPhoto'} answer 
   */
  savePhoto(chatId, answer) {
    if (answer == 'savePhoto') {
      this.TelBot.downloadFile(this.savePhotoId, 'uploads')
      this.TelBot.sendMessage(chatId, 'Сохранено')
    } else if (answer == 'denyPhoto') {
      this.TelBot.sendMessage(chatId, 'Охрана, отмена')
    } else {
      this.TelBot.sendMessage('Error')
    }

    this.savePhotoId = null
    this.curState = "pendingPhoto"
  }
}