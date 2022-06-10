import { readFileSync } from "fs"
import path from "path"

/**
 * @typedef {Object} BotChat
 * @property {number} chatId
 * @property {import("./finiteStateMachineBot").State} curState
 * @property {string} savePhotoId
 */

/**
 * @type {BotChat[]}
 */
const botChats = readFileSync(path.resolve('server', 'database', 'botChats.json'))

const declarations = readFileSync(path.resolve('server', 'database', 'declarations.json'))
const docs = readFileSync(path.resolve('server', 'database', 'docs.json'))

export { declarations, docs, botChats }
