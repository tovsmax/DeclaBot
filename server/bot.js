import axios from 'axios'
import TelegramBot from 'node-telegram-bot-api'
import jsonpath from 'jsonpath'
import FiniteStateMachineBot from './finiteStateMachineBot.js'
import { getString } from './localization.js'

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
        description: getString(lang, 'commandDecriptions', 'start'),
      },
      {
        command: '/botsettings',
        description: getString(lang, 'commandDecriptions', 'botsettings'),
      },
      {
        command: '/replykeyboard',
        description: getString(lang, 'commandDecriptions', 'replykeyboard'),
      },
      {
        command: '/editmsgtest',
        description: getString(lang, 'commandDecriptions', 'editmsgtest'),
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
      getString(msg.from.language_code, 'nogroup', 'echo').replace(
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
          getString(lang, 'commandDecriptions', 'commands') + commandsStr
        )
      })
    if (fsmBot.checkState('none')) {
      fsmBot.start(msg.chat.id)
    }
  })

  TelBot.onText(/\/botsettings/, (msg) => {
    botsettings(msg.chat.id, msg.from.language_code)
  })

  /**
   *
   * @param {number} chatId
   * @param {import('./localization.js').LanguageCode} lang
   */
  function botsettings(chatId, lang) {
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
      option.menuOption = 'menu.connectCloudStorage' // `${menuName}/${option.name}`
    }

    /** @type {ButtomButton[]} */
    const buttomButtons = [
      {
        buttonText: getString(lang, `${menuName}Options`, 'close'),
        destination: 'menu.close', // `${menuName}/close`
      },
    ]

    const menuText = 'New ' + getString(lang, `${menuName}Messages`, menuGroups[menuName].name)
    const inlineKeyboard = createInlineKeyboard(
      options,
      buttomButtons
    )
    TelBot.sendMessage(chatId, menuText, {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      }
    })
  }

  /**
   *
   * @param {string} menuOption - a string contains pattern `<menuGroupName>/<option>`, where
   * - `menuGroupName` - is a name of a whole menu group
   * - `option` - is a name of option located somewhere in menu `menuGroupName`
   */
  function fireMenuOption(menuOption) {
    const [menuGroupName, optionName] = menuOption.split('/')
    /** @type {Menu} */
    const option = jsonpath.query(
      menuGroups[menuGroupName],
      `$..*[?(@.name=="${optionName}")]`
    )[0]
  }

  function closeMenu(chatId, messageId) {
    TelBot.deleteMessage(chatId, messageId)
  }

  /**
   * @typedef {Object} ButtomButton
   * @prop {string} buttonText
   * @prop {string} destination - option name to go
   */

  /**
   * @param {Option[]} options
   * @param {ButtomButton[]} buttomButtons - a row of additional options
   */
  function createInlineKeyboard(options, buttomButtons) {
    const inlineKeyboardRows = []
    for (const option of options) {
      /** @type {import('node-telegram-bot-api').InlineKeyboardButton} */
      const button = {
        text: option.text,
        callback_data: option.options ? option.menuOption : undefined,
      }

      const params = option.params
      if (params) {
        for (const param of Object.keys(params)) {
          button[param] = params[param]
        }
      }

      inlineKeyboardRows.push([button])
    }

    const buttomButtonCol = []
    for (const buttomButton of buttomButtons) {
      /** @type {import('node-telegram-bot-api').InlineKeyboardButton} */
      const button = {
        text: buttomButton.buttonText,
        callback_data: buttomButton.destination,
      }
      buttomButtonCol.push(button)
    }
    inlineKeyboardRows.push(buttomButtonCol)

    return inlineKeyboardRows
  }

  TelBot.on('callback_query', (query) => {
    const lang = query.from.language_code
    switch (query.data) {
      case 'menu.connectCloudStorage':
        TelBot.editMessageText(
          getString(lang, 'mainMenuMessages', 'connectCloudStorage'),
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: getString(lang, 'mainMenuOptions', 'GoogleDrive'),
                    callback_data: 'connectCloudStorage.GoogleDrive',
                  },
                  {
                    text: getString(lang, 'mainMenuOptions', 'OneDrive'),
                    callback_data: 'connectCloudStorage.OneDrive',
                  },
                ],
              ],
            },
          }
        )
        break
      case 'connectCloudStorage.GoogleDrive':
        TelBot.editMessageText(
          getString(lang, 'mainMenuMessages', 'GoogleDrive'),
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: getString(lang, 'mainMenuOptions', 'authorization'),
                    callback_data: 'authorization',
                    url: 'https://declabot.loca.lt/mockAuth.html',
                  },
                  {
                    text: getString(lang, 'mainMenuOptions', 'menu'),
                    callback_data: 'menu',
                  },
                ],
              ],
            },
          }
        )
        break
      case 'connectCloudStorage.OneDrive':
        TelBot.editMessageText(getString(lang, 'mainMenuOptions', 'OneDrive'), {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: getString(lang, 'mainMenuOptions', 'authorization'),
                  url: 'https://declabot.loca.lt/mockAuth.html',
                },
                {
                  text: getString(lang, 'mainMenuOptions', 'menu'),
                  callback_data: 'menu',
                },
              ],
            ],
          },
        })
        break
      case 'menu':
        TelBot.editMessageText('Old ' + getString(lang, 'mainMenuMessages', 'menu'), {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: getString(
                    lang,
                    'mainMenuOptions',
                    'connectCloudStorage'
                  ),
                  callback_data: 'menu.connectCloudStorage',
                },
                {
                  text: getString(lang, 'mainMenuOptions', 'close'),
                  callback_data: 'menu.close',
                },
              ],
            ],
          },
        })
        break
      case 'menu.close':
        closeMenu(query.message.chat.id, query.message.message_id)
        break
    }
  })

  /**
   * @type {Object.<string, Menu>}
   */
  const menuGroups = {
    mainMenu: {
      name: 'menu',
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
              ]
            },
          ],
        },
      ],
    },
  }

  // const buttomButtons = [
  //   {
  //     name: ''
  //   }
  // ]

  TelBot.onText(/\/replykeyboard/, (msg) => {
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

  TelBot.onText(/\/editmsgtest/, (msg) => {
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
      TelBot.editMessageText(`"${query.data}" was choosen`, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      })
    }
  })
}
