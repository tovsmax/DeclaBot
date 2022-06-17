import TelegramBot from 'node-telegram-bot-api'

/** @typedef {('none'|'pendingFile'|'pendingAnswer')} State */

/**
 * Часть Declabot, связання с конечными автоматами
 */
export default class FiniteStateMachineBot {
  /**
   *
   * @param {TelegramBot} TelBot
   */
  constructor(TelBot) {
    /** @type {State} */
    this.curState = 'none'
    this.saveFileId = null
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
    this.curState = 'pendingFile'
    this.TelBot.sendMessage(chatId, 'Жду файла')
  }

  silentStart() {
    this.curState = 'pendingFile'
  }

  /**
   *
   * @param {Number} chatId
   * @param {String} fileId
   */
  ask(chatId, fileId) {
    this.saveFileId = fileId

    this.TelBot.sendMessage(chatId, 'Хотите сохранить файл?', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Сохранить',
              callback_data: 'saveFile',
            },
            {
              text: 'Отменить',
              callback_data: 'denyFile',
            },
          ],
        ],
      },
    })

    this.curState = 'pendingAnswer'
  }

  /**
   *
   * @param {Number} chatId
   * @param {'saveFile'|'denyFile'} answer
   */
  saveFile(chatId, answer) {
    if (answer == 'saveFile') {
      this.TelBot.downloadFile(this.saveFileId, 'uploads')
      this.TelBot.sendMessage(chatId, 'Сохранено')
    } else if (answer == 'denyFile') {
      this.TelBot.sendMessage(chatId, 'Охрана, отмена')
    } else {
      this.TelBot.sendMessage('Error')
    }

    this.saveFileId = null
    this.curState = 'pendingFile'
  }
}
