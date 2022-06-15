import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import FiniteStateMachineBot from "./finiteStateMachineBot.js";

export default function createBot(pageUrl) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  const TelBot = new TelegramBot(BOT_TOKEN, {polling: true})
  const fsmBot = new FiniteStateMachineBot(TelBot)

  axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
    commands: [
      {
        command: '/start',
        description: 'Регистрация чата для бота'
      },
      {
        command: '/setup',
        description: 'Настройка бота для работы с облаком'
      },
      {
        command: '/replykeyboard',
        description: 'test reply keyborad'
      },
      {
        command: '/editmsgtest',
        description: 'test edit msg'
      }
    ]
  })

  TelBot.onText(/^(?!\/).+/, msg => {
    TelBot.sendMessage(msg.chat.id, `Вы написали "${msg.text}"`)
  })


  TelBot.onText(/\/start/, msg => {
    TelBot.getMyCommands().then(commands => {
      let commandsStr = ''
      for (const command of commands) {
        commandsStr += `\n/${command.command} - ${command.description}`
      }
      TelBot.sendMessage(msg.chat.id, `Данный бот имеет следующие команды:${commandsStr}`)

    })
    if (fsmBot.checkState('none')) {
      fsmBot.start(msg.chat.id)
    }
  })

  TelBot.onText(/\/setup/, msg => {
    TelBot.sendMessage(msg.chat.id, 'Меню', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Подключение облачного хранилища',
              callback_data: 'menu.connectCloudStorage'
            },
            {
              text: 'Закрыть меню',
              callback_data: 'menu.close'
            }
          ]
        ]
      }
    })
  })

  TelBot.on('callback_query', query => {
    switch (query.data) {
      case 'menu.connectCloudStorage':
        TelBot.editMessageText('Какое хранилище хотите подключить?', {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Google Drive',
                  callback_data: 'connectCloudStorage.GoogleDrive'
                },
                {
                  text: 'Microsoft OneDrive',
                  callback_data: 'connectCloudStorage.OneDrive'
                }
              ]
            ]
          }
        })
        break
      case 'connectCloudStorage.GoogleDrive':
        TelBot.editMessageText('Нажмите на кнопку для авторизации', {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Авторизоваться',
                  callback_data: 'authotization',
                  url: 'https://declabot.loca.lt/mockAuth.html'
                },
                {
                  text: 'Вернуться к меню',
                  callback_data: 'menu'
                }
              ]
            ]
          }
        })
        break
      case 'connectCloudStorage.OneDrive':
        TelBot.editMessageText('Нажмите на кнопку для авторизации', {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Авторизоваться',
                  url: 'https://declabot.loca.lt/mockAuth.html'
                },
                {
                  text: 'Вернуться к меню',
                  callback_data: 'menu'
                }
              ]
            ]
          }
        })
        break
      case 'menu':
        TelBot.editMessageText('Меню', {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Подключение облачного хранилища',
                  callback_data: 'menu.connectCloudStorage'
                },
                {
                  text: 'Закрыть меню',
                  callback_data: 'menu.close'
                }
              ]
            ]
          }
        })
        break
      case 'menu.close':
        TelBot.deleteMessage(query.message.chat.id, query.message.message_id)
        break
    }
  })

  TelBot.onText(/\/replykeyboard/, msg => {
    TelBot.sendMessage(msg.chat.id, 'choose', {
      reply_markup: {
        keyboard: [
          [
            {
              text: '1'
            },
            {
              text: '2'
            }
          ],
          [
            {
              text: '3'
            },
            {
              text: '4'
            }
          ]
        ],
        one_time_keyboard: true,
        input_field_placeholder: 'Placeholder'
      }
    })
  })

  TelBot.onText(/\/editmsgtest/, msg => {
    TelBot.sendMessage(msg.chat.id, "test", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'send 1',
              callback_data: 'test.query1'
            },
            {
              text: 'send 2',
              callback_data: 'test.query2'
            }
          ]
        ]
      }
    })
  })

  TelBot.on('message', msg => {
    const user = msg.from.first_name || msg.from.username || msg.from.id
    const content = msg.text || msg.photo.toString() || msg.document.file_name
    console.log(`[${user}]: ${content}`)
  })

  TelBot.on('message', msg => {
    if (fsmBot.checkState('none')) {
      fsmBot.silentStart()
    }
  })

  TelBot.on('message', msg => {
    if (fsmBot.checkState('pendingFile')) {
      const queryFileId = 
        (msg.photo && msg.photo[msg.photo.length - 1])
        ? msg.photo[msg.photo.length - 1].file_id
        : (msg.document)
        ? msg.document.file_id
        : null
      
      if (queryFileId) {
        fsmBot.ask(msg.chat.id, queryFileId)
      }
    }
  })

  TelBot.on('callback_query', query => {
    if (fsmBot.checkState('pendingAnswer')) {
      fsmBot.saveFile(query.message.chat.id, query.data)
      TelBot.deleteMessage(query.message.chat.id, query.message.message_id)
    }
  })

  TelBot.on('callback_query', query => {
    if (query.data.includes('test.query')) {
      TelBot.editMessageText(`"${query.data}" was choosen`, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      })
    }
  })
}