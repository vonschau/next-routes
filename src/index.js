import { pathToRegexp, compile } from 'path-to-regexp'
import React from 'react'
import NextLink from 'next/link'
import NextRouter from 'next/router'
import { URL } from 'url'

module.exports = opts => new Routes(opts)

class Routes {
  constructor ({
    Link = NextLink,
    Router = NextRouter,
    locale,
    hideDefaultLocale = false
  } = {}) {
    this.routes = []
    this.Link = this.getLink(Link)
    this.Router = this.getRouter(Router)
    this.locale = locale
    this.defaultLocale = locale
    this.hideDefaultLocale = hideDefaultLocale
  }

  add (name, locale = this.locale, pattern, page, data, update = false, prefetch = false) {
    let options
    if (name instanceof Object) {
      options = name

      if (!options.name) {
        throw new Error('Unnamed routes not supported')
      }

      name = options.name

      if (!options.page) {
        options.page = options.name
      }

      locale = options.locale || this.locale
      update = options.update || false
    } else {
      if (typeof page === 'object') {
        data = page
        page = name
      } else {
        page = page || name
      }

      options = { name, locale, pattern, page, prefetch }

      if (data) {
        options.data = data
      }
    }

    options.hideLocale = !!this.hideDefaultLocale && options.locale === this.defaultLocale

    if (this.findByName(name, locale)) {
      if (update) {
        // remove old route on update
        this.routes = this.routes.filter(route => route.name !== name || route.locale !== locale)
      } else {
        throw new Error(`Route "${name}" already exists`)
      }
    }

    this.routes.push(new Route(options))

    return this
  }

  setLocale (locale) {
    this.locale = locale
  }

  setRoutes (routes) {
    if (Array.isArray(routes)) {
      this.routes = []
      routes.forEach(route => {
        this.add(route.name, route.locale, route.pattern, route.page, route.data)
      })
    } else if (typeof routes === 'object') {
      this.routes = []
      this.add(routes.name, routes.locale, routes.pattern, routes.page, routes.data)
    } else {
      throw new Error('Data passed to setRoutes is neither an array nor an object')
    }
  }

  findByName (name, locale) {
    if (name) {
      return this.routes.filter(route => route.name === name && route.locale === locale)[0]
    }
  }

  match (url) {
    const parsedUrl = new URL(url, url.indexOf('//') === -1 ? 'http://localhost' : undefined)
    const { pathname, searchParams } = parsedUrl
    const query = {}
    for (const [key, value] of searchParams.entries()) {
      query[key] = value
    }

    return this.routes.reduce((result, route) => {
      if (result.route) {
        return result
      }

      const params = route.match(pathname)

      if (!params) {
        return result
      }

      Object.keys(params).forEach((key) => {
        params[key] = decodeURIComponent(params[key])
      })

      return { ...result, route, params, query: { ...query, ...params, nextRoute: route.name } }
    }, { query, parsedUrl })
  }

  findAndGetUrls (name, locale, params) {
    locale = locale || this.locale
    const route = this.findByName(name, locale)

    if (route) {
      return { route, urls: route.getUrls(params), byName: true }
    } else {
      return { route: this.routes[0], urls: this.routes[0].getUrls(params), byName: true }
      // throw new Error(`Route "${name}" not found`)
    }
  }

  getRequestHandler (app, customHandler) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      const { route, query, parsedUrl } = this.match(req.url)

      if (route) {
        req.locale = route.locale
        req.nextRoute = route

        if (customHandler) {
          customHandler({ req, res, route, query })
        } else {
          app.render(req, res, route.page, query)
        }
      } else {
        nextHandler(req, res, parsedUrl)
      }
    }
  }

  getLink (Link) {
    return props => {
      const { href, locale, params, ...newProps } = props
      const locale2 = locale || this.locale
      const prefetch = props.prefetch || false

      if (href.indexOf('//') !== -1 || href[0] === '/' || href[0] === '#') {
        let propsToPass
        if (Link.propTypes) {
          const allowedKeys = Object.keys(Link.propTypes)
          propsToPass = allowedKeys.reduce((obj, key) => {
            Object.prototype.hasOwnProperty.call(props, key) && (obj[key] = props[key])
            return obj
          }, {})
        } else {
          propsToPass = props
        }
        return <Link {...propsToPass} />
      }

      newProps.prefetch = prefetch
      Object.assign(newProps, this.findAndGetUrls(href, locale2, params).urls)

      return <Link {...newProps} />
    }
  }

  getRouter (Router) {
    const wrap = method => (route, params, locale, options) => {
      const { byName, urls: { as, href } } = this.findAndGetUrls(route, locale, params)
      return Router[method](href, as, byName ? options : params)
    }

    Router.pushRoute = wrap('push')
    Router.replaceRoute = wrap('replace')
    Router.prefetchRoute = wrap('prefetch')
    return Router
  }
}

class Route {
  constructor ({ name, locale, pattern, page, data, hideLocale, prefetch }) {
    if (!name && !page) {
      throw new Error(`Missing page to render for route "${pattern}"`)
    }

    this.name = name
    this.locale = locale
    this.pattern = name === 'homepage' ? '' : (pattern || `/${name}`)
    this.page = page.replace(/(^|\/)homepage/, '').replace(/^\/?/, '/')
    this.regex = pathToRegexp(this.pattern, this.keys = [])
    this.keyNames = this.keys.map(key => key.name)
    this.toPath = compile(this.pattern)
    this.data = data || {}
    this.hideLocale = hideLocale || false
    this.prefetch = prefetch || false
  }

  match (path) {
    if (!this.hideLocale && path.substring(1, this.locale.length + 1) === this.locale) {
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
    return `${this.page}?${toQuerystring({ ...params, nextRoute: this.name })}`
  }

  getAs (params = {}) {
    let as = (this.hideLocale ? '' : '/' + this.locale) + this.toPath(params)
    const keys = Object.keys(params)
    const qsKeys = keys.filter(key => this.keyNames.indexOf(key) === -1)

    if (as === '') {
      as = '/'
    }

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
