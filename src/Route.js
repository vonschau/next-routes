import pathToRegexp from 'path-to-regexp'

export default class Route {
  constructor ({ name, locale, pattern, page, data, isDefaultLocale = false, forceLocale = false }) {
    if (!name && !page) {
      throw new Error(`Missing page to render for route "${pattern}"`)
    }

    this.name = name
    this.locale = locale
    this.isDefaultLocale = isDefaultLocale
    this.forceLocale = forceLocale
    this.pattern = name === 'homepage' ? '' : (pattern || `/${name}`)
    this.page = page.replace(/(^|\/)homepage/, '').replace(/^\/?/, '/')
    this.regex = pathToRegexp(buildPattern(isDefaultLocale, locale, this.pattern), this.keys = [])
    this.keyNames = this.keys.map(key => key.name)
    this.toPath = pathToRegexp.compile(this.pattern)
    this.data = data || {}
  }

  match (path) {
    if (this.forceLocale) {
      const rgx = new RegExp(`/${this.locale}(/?)`)
      if (!rgx.test(path)) {
        return
      }
    }

    const values = this.regex.exec(path)
    if (values) {
      return this.valuesToParams(values.slice(1))
    }
  }

  valuesToParams (values) {
    return values.reduce((params, val, i) => Object.assign(params, {
      [this.keys[i].name]: val
    }), {})
  }

  getHref (params = {}) {
    return `${this.page}?${toQuerystring(params)}`
  }

  getAs (params = {}) {
    const as = '/' + this.locale + this.toPath(params)
    const keys = Object.keys(params)
    const qsKeys = keys.filter(key => this.keyNames.indexOf(key) === -1)

    if (!qsKeys.length) return as

    const qsParams = qsKeys.reduce((qs, key) => Object.assign(qs, {
      [key]: params[key]
    }), {})

    return `${as}?${toQuerystring(qsParams)}`
  }

  getUrls (params) {
    const as = this.getAs(params)
    const href = this.getHref(params)
    return { as, href }
  }
}

const buildPattern = (isDefaultLocale, locale, pattern) => {
  const startWithSlash = pattern.startsWith('/')
  if (isDefaultLocale) {
    return `/:locale(${locale})?${startWithSlash ? '' : '/'}${pattern}`
  }
  return `/:locale(${locale})${startWithSlash ? '' : '/'}${pattern}`
}

const toQuerystring = obj => Object.keys(obj).map(key => {
  let value = obj[key]
  if (Array.isArray(value)) {
    value = value.join('/')
  }
  return [
    encodeURIComponent(key),
    encodeURIComponent(value)
  ].join('=')
}).join('&')
