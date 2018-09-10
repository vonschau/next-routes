'use strict'

import locales from './../config/regionalLocales'
export default (locale = '') => {

  if (!locale) {
    return ''
  }

  return locales[locale] || ''
}