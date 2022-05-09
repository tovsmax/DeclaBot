# Установка репозитория

1. Настройка гит
2. `git clone https://github.com/tovsmax/DeclaBot .` - для копирования репозитория на компьютер в текущую папку
3. `npm install` - для установки всех необходимых библиотек

# Запуск серверных скриптов

- `npm run gendoc` - создание актуальной документации по API, доступ к которой можно получить по маршруту /api-doc
- `npm run dev` - запуск сервера с перезапусками при изменениях или при **ctrl+s**
- `npm start` || `npm run start` - простой запуск сервера

# Структура репозитория

- **.vscode** - настройки вскода и набор gendoc сниппетов
- **client** - файлы фронтенда (html, стандартный js)
- **server** - файлы бекенда
- **swagger** - файлы документации DeclaBot API, где `gendoc.js` - скрипт для её автогенерации, а `output.json` - документация в виде json