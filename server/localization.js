import { readFileSync } from 'fs'
import { resolve } from 'path'

const enLocaleFile = readFileSync(resolve('server', 'localizations', 'en.json'))
const ruLocaleFile = readFileSync(resolve('server', 'localizations', 'ru.json'))

/** @type {Object.<string, Locale>} */
const localizations = {
  en: JSON.parse(enLocaleFile),
  ru: JSON.parse(ruLocaleFile)
}

let defaultLocale = 'en'

/** @typedef {('en'|'ru')} LanguageCode */

/** @type {('userLocale'|LanguageCode)} */
let curLocale = 'userLocale'

/**
 * 
 * @param {('userLocale'|LanguageCode)} newLocale 
 */
function setCurrentLocale(newLocale) {
  curLocale = newLocale
}

function getCurrentLocale() {
  return curLocale
}

/**
 * 
 * @param {LanguageCode} curUserLocale 
 * @param {string} group 
 * @param {string} textId 
 * @returns 
 */
function getString(curUserLocale = null, group, textId) {
  const locale = 
    (curUserLocale === null)
    ? localizations[defaultLocale]
    : (curLocale === 'userLocale')
    ? localizations[curUserLocale]
    : localizations[curLocale]

  /** @type {string} */
  const text = locale[group][textId] 
    || localizations[defaultLocale][group][textId]
  return text
}

export { getString, getCurrentLocale, setCurrentLocale }