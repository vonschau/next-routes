import pathToRegexp from 'path-to-regexp'
import React from 'react'
import { parse } from 'url'
import NextLink from 'next/link'
import NextRouter from 'next/router'

module.exports = opts => new Routes(opts)

class Routes {
  constructor ({
                 Link = NextLink,
                 Router = NextRouter,
                 locale
               } = {}) {
    this.routes = []
    this.Link = this.getLink(Link)
    this.Router = this.getRouter(Router)
    this.locale = locale
  }

  add (name, locale = this.locale, pattern, page) {
    let options
    if (name instanceof Object) {
      options = name

      if (!options.name) {
        throw new Error(`Unnamed routes not supported`)
      }

      name = options.name
      locale = options.locale || this.locale
    } else {
      options = {name, locale, pattern, page}
    }

    if (this.findByName(name, locale)) {
      throw new Error(`Route "${name}" already exists`)
    }

    this.routes.push(new Route(options))
    return this
  }

  setLocale (locale) {
    this.locale = locale
  }

  findByName (name, locale) {
    if (name) {
      return this.routes.filter(route => route.name === name && route.locale === locale)[0]
    }
  }

  match (url) {
    const parsedUrl = parse(url, true)
    const {pathname, query} = parsedUrl

    return this.routes.reduce((result, route) => {
      if (result.route) {
        return result
      }

      const params = route.match(pathname)

      if (!params) {
        return result
      }

      return {...result, route, params, query: {...query, ...params}}
    }, {query, parsedUrl})
  }

  findAndGetUrls (name, locale, params) {
    const route = this.findByName(name, locale)

    if (route) {
      return {route, urls: route.getUrls(params), byName: true}
    } else {
      throw new Error(`Route "${name}" not found`)
    }
  }

  getRequestHandler (app, customHandler) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      const {route, query, parsedUrl} = this.match(req.url)

      if (route) {
        if (customHandler) {
          customHandler({req, res, route, query})
        } else {
          app.render(req, res, route.page, query)
        }
      } else {
        nextHandler(req, res, parsedUrl)
      }
    }
  }

  getLink (Link) {
    const LinkRoutes = props => {
      const {route, l, params, to, ...newProps} = props
      const nameOrUrl = route || to
      const locale = l || this.locale

      if (nameOrUrl) {
        Object.assign(newProps, this.findAndGetUrls(nameOrUrl, locale, params).urls)
      }

      return <Link {...newProps} />
    }
    return LinkRoutes
  }

  getRouter (Router) {
    const wrap = method => (route, locale, params, options) => {
      const {byName, urls: {as, href}} = this.findAndGetUrls(route, locale, params)
      return Router[method](href, as, byName ? options : params)
    }

    Router.pushRoute = wrap('push')
    Router.replaceRoute = wrap('replace')
    Router.prefetchRoute = wrap('prefetch')
    return Router
  }
}

class Route {
  constructor ({name, locale, pattern, page = name}) {
    if (!name && !page) {
      throw new Error(`Missing page to render for route "${pattern}"`)
    }

    this.name = name
    this.locale = locale
    this.pattern = name === 'homepage' ? '' : (pattern || `/${name}`)
    this.page = page.replace(/(^|\/)homepage/, '').replace(/^\/?/, '/')
    this.regex = pathToRegexp(this.pattern, this.keys = [])
    this.keyNames = this.keys.map(key => key.name)
    this.toPath = pathToRegexp.compile(this.pattern)
  }

  match (path) {
    if (path.substring(1, this.locale.length + 1) === this.locale) {
      path = path.substring(this.locale.length + 1)

      if (!path) {
        return {}
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
    return {as, href}
  }
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
