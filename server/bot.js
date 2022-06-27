import axios from 'axios'
import TelegramBot from 'node-telegram-bot-api'
import jsonpath from 'jsonpath'
import FiniteStateMachineBot from './finiteStateMachineBot.js'
import { getString } from './localization.js'
import { JSONPath } from 'jsonpath-plus'

const BOT_TOKEN = process.env.BOT_TOKEN

/**
 *
 * @param {import("./localization.js").LanguageCode} lang
 * @returns
 */
function createMyCommands(lang) {
  axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
    language_code: lang,
    commands: [
      {
        command: '/start',
        description: getString(lang, 'commandDescriptions', 'start'),
      },
      {
        command: '/bot_settings',

        description: getString(lang, 'commandDescriptions', 'bot_settings'),
      },
      {
        command: '/reply_keyboard',
        description: getString(lang, 'commandDescriptions', 'reply_keyboard'),
      },
      {
        command: '/edit_msg_test',
        description: getString(lang, 'commandDescriptions', 'edit_msg_test'),
      },
    ],
  })
}

export default function createBot(pageUrl) {
  const TelBot = new TelegramBot(BOT_TOKEN, { polling: true })
  const fsmBot = new FiniteStateMachineBot(TelBot)

  createMyCommands('en')
  createMyCommands('ru')

  TelBot.onText(/^(?!\/).+/, (msg) => {
    TelBot.sendMessage(
      msg.chat.id,
      getString(msg.from.language_code, 'no_group', 'echo').replace(
        '%messageText%',
        msg.text
      )
    )
  })

  TelBot.onText(/\/start/, (msg) => {
    const lang = msg.from.language_code
    axios
      .post(`https://api.telegram.org/bot${BOT_TOKEN}/getMyCommands`, {
        language_code: lang,
      })
      .then((res) => {
        const commands = res.data.result
        let commandsStr = ''
        for (const command of commands) {
          commandsStr += `\n/${command.command} - ${command.description}`
        }
        TelBot.sendMessage(
          msg.chat.id,
          getString(lang, 'commandDescriptions', 'commands') + commandsStr
        )
      })
    if (fsmBot.checkState('none')) {
      fsmBot.start(msg.chat.id)
    }
  })

  TelBot.onText(/\/bot_settings/, (msg) => {
    bot_settings(msg.chat.id, msg.from.language_code)
  })

  /**
   *
   * @param {number} chatId
   * @param {import('./localization.js').LanguageCode} lang
   */
  function bot_settings(chatId, lang) {
    createMenu(chatId, lang, 'mainMenu')
  }

  /**
   * @typedef {Object} Menu
   * @prop {string} name
   * @prop {Menu[]} [options]
   * @prop {Object} [params]
   * @prop {string} [params.url]
   * @prop {string} [params.webapp]
   * @prop {function} [params.action]
   */

  /**
   * @typedef {Menu|{text: string, menuOption: string}} Option
   */

  /**
   *
   * @param {number} chatId
   * @param {string} lang
   * @param {string} menuName
   */
  function createMenu(chatId, lang, menuName) {
    /** @type {Option[]} */
    const options = menuGroups[menuName].options
    for (const option of options) {
      option.text = getString(lang, `${menuName}Options`, option.name)
      option.menuOption = `${menuName}/${option.name}`
    }

    /** @type {BottomButton[]} */
    const bottomButtons = [
      {
        buttonText: getString(lang, 'bottomButtons', 'close'),
        destination: 'close'
      },
    ]

    const menuText = getString(
      lang,
      `${menuName}Messages`,
      menuGroups[menuName].name
    )
    const inlineKeyboard = createInlineKeyboard(options, bottomButtons)
    TelBot.sendMessage(chatId, menuText, {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    })
  }

  /**
   *
   * @param {number} chatId
   * @param {number} messageId
   * @param {import('./localization.js').LanguageCode} lang
   * @param {string} menuOption - a string contains pattern `<menuGroupName>/<option>`, where
   * - `menuGroupName` - is a name of a whole menu group
   * - `option` - is a name of option located somewhere in menu `menuGroupName`
   */
  function fireMenuOption(chatId, messageId, lang, menuOption) {
    const [menuName, optionName] = menuOption.split('/')
    const curMenuGroup = menuGroups[menuName]

    // TODO: replace jsonpath to Menu.path
    /** @type {Menu} */
    const menu = JSONPath(`$..*[?(@.name=="${optionName}")]`, curMenuGroup)[0] || curMenuGroup
    /** @type {Menu} */
    const parent = JSONPath(
      `$..*[?(@.name=="${optionName}")]^^^`,
      curMenuGroup
    )[0]

    const curOptionsGroupString = `${menuName}Options`

    /** @type {Option[]} */
    const options = menu.options
    if (options && options.length !== 0) {
      for (const option of options) {
        option.text = getString(lang, curOptionsGroupString, option.name)
        option.menuOption = `${menuName}/${option.name}`
      }
    }

    /** @type {BottomButton[]} */
    const bottomButtons = []
    if (optionName === curMenuGroup.name) {
      bottomButtons.push({
        buttonText: getString(lang, 'bottomButtons', 'close'),
        destination: `close`,
      })
    } else {
      bottomButtons.push({
        buttonText: getString(lang, 'bottomButtons', 'back'),
        destination: `${menuName}/${parent.name}`,
      },
      {
        buttonText: getString(lang, curOptionsGroupString, curMenuGroup.name),
        destination: `${menuName}/${curMenuGroup.name}`,
      })
    }

    const text = getString(lang, `${menuName}Messages`, menu.name)
    const inlineKeyboard = createInlineKeyboard(options, bottomButtons)
    TelBot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    })
  }

  /**
   *
   * @param {import('node-telegram-bot-api').CallbackQuery} query
   */
  function closeMenu(query) {
    TelBot.deleteMessage(query.message.chat.id, query.message.message_id)
  }

  /**
   * @typedef {Object} BottomButton
   * @prop {string} buttonText
   * @prop {string} destination - option name to go
   */

  /**
   * @param {Option[]} [options]
   * @param {BottomButton[]} bottomButtons - a row of additional options
   */
  function createInlineKeyboard(options, bottomButtons) {
    const inlineKeyboardRows = []

    if (options) {
      for (const option of options) {
        /** @type {import('node-telegram-bot-api').InlineKeyboardButton} */
        const button = {
          text: option.text,
        }

        const params = option.params
        if (params) {
          for (const param of Object.keys(params)) {
            button[param] = params[param]
          }
        } else {
          button.callback_data = option.options ? option.menuOption : 'None'
        }

        inlineKeyboardRows.push([button])
      }
    }

    const bottomButtonCol = []
    for (const bottomButton of bottomButtons) {
      /** @type {import('node-telegram-bot-api').InlineKeyboardButton} */
      const button = {
        text: bottomButton.buttonText,
        callback_data: bottomButton.destination,
      }
      bottomButtonCol.push(button)
    }
    inlineKeyboardRows.push(bottomButtonCol)

    return inlineKeyboardRows
  }

  TelBot.on('callback_query', (query) => {
    const queryData = query.data

    if (query.data === 'close') {
      closeMenu(query)
      return
    }

    const menuList = Object.keys(menuGroups)
    const menu = queryData.match(/^\w+/)[0] //TODO: need to rewrite this
    if (menuList.includes(menu)) {
      fireMenuOption(
        query.message.chat.id,
        query.message.message_id,
        query.from.language_code,
        queryData
      )
    }
  })

  /**
   * @type {Object.<string, Menu>}
   */
  const menuGroups = {
    mainMenu: {
      name: 'mainMenu',
      options: [
        {
          name: 'connectCloudStorage',
          options: [
            {
              name: 'GoogleDrive',
              options: [
                {
                  name: 'GAuth',
                  params: {
                    url: 'https://declabot.loca.lt/mockAuth.html',
                  },
                },
              ],
            },
            {
              name: 'OneDrive',
              options: [
                {
                  name: 'MAuth',
                },
              ],
            },
          ],
        },
      ],
    },
  }

  // const bottomButtons = [
  //   {
  //     name: ''
  //   }
  // ]

  TelBot.onText(/\/reply_keyboard/, (msg) => {
    TelBot.sendMessage(msg.chat.id, 'choose', {
      reply_markup: {
        keyboard: [
          [
            {
              text: '1',
            },
            {
              text: '2',
            },
          ],
          [
            {
              text: '3',
            },
            {
              text: '4',
            },
          ],
        ],
        one_time_keyboard: true,
        input_field_placeholder: 'Placeholder',
      },
    })
  })

  TelBot.onText(/\/edit_msg_test/, (msg) => {
    TelBot.sendMessage(msg.chat.id, 'test', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'send 1',
              callback_data: 'test.query1',
            },
            {
              text: 'send 2',
              callback_data: 'test.query2',
            },
          ],
        ],
      },
    })
  })

  TelBot.on('message', (msg) => {
    const user = `${msg.from.first_name}@${msg.from.username}#${msg.from.id}`
    const content = msg.text || msg.photo.toString() || msg.document.file_name
    console.log(`[${user}]: ${content}`)
  })

  TelBot.on('message', (msg) => {
    if (fsmBot.checkState('none')) {
      fsmBot.silentStart()
    }
  })

  TelBot.on('message', (msg) => {
    if (fsmBot.checkState('pendingFile')) {
      const queryFileId =
        msg.photo && msg.photo[msg.photo.length - 1]
          ? msg.photo[msg.photo.length - 1].file_id
          : msg.document !== undefined
          ? msg.document.file_id
          : null

      if (queryFileId) {
        fsmBot.ask(msg.chat.id, queryFileId)
      }
    }
  })

  TelBot.on('callback_query', (query) => {
    if (fsmBot.checkState('pendingAnswer')) {
      fsmBot.saveFile(query.message.chat.id, query.data)
      TelBot.deleteMessage(query.message.chat.id, query.message.message_id)
    }
  })

  TelBot.on('callback_query', (query) => {
    if (query.data.includes('test.query')) {
      TelBot.editMessageText(`"${query.data}" was chosen`, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      })
    }
  })
}
