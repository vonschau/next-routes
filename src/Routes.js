import React from 'react'
import { parse } from 'url'
import NextLink from 'next/link'
import NextRouter from 'next/router'
import Route from './Route'
import { generateRouteFromObjectName } from './helpers/routeHelper'

export default class Routes {
  constructor ({ Link = NextLink, Router = NextRouter, locale, forceLocale = false, siteName } = {}) {
    this.routes = []
    this.Link = this.getLink(Link)
    this.Router = this.getRouter(Router)
    this.locale = locale
    this.forceLocale = forceLocale
    this.siteName = siteName
  }

  add (name, locale = this.locale, pattern, page, data, update = false) {
    let options
    if (name instanceof Object) {
      options = generateRouteFromObjectName(name)
    } else {
      if (typeof page === 'object') {
        data = page
        page = name
      } else {
        page = page || name
      }

      options = { name, locale, pattern, page }
    }

    if (data) {
      options.data = data
    }

    options.isDefaultLocale = locale === this.locale
    options.forceLocale = this.forceLocale

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

  findByName (name, locale = this.locale) {
    if (name) {
      return this.routes.filter(route => route.name === name && route.locale === locale)[0] || false
    }
  }

  match (url) {
    const parsedUrl = parse(url, true)
    const { pathname, query } = parsedUrl

    return this.routes.reduce((result, route) => {
      if (result.route) {
        return result
      }
      const params = route.match(pathname)
      if (!params) {
        return result
      }

      return { ...result, route, params, query: { ...query, ...params } }
    }, { query, parsedUrl })
  }

  findAndGetUrls (name, locale = this.locale, params = {}) {
    locale = locale || this.locale
    const route = this.findByName(name, locale)

    if (route) {
      return { route, urls: route.getUrls(params), byName: true }
    } else {
      throw new Error(`Route "${name}" not found`)
    }
  }

  getMultilanguageUrls (route, query) {
    return this.routes.filter((r) => {
      return r.name === route.name
    }).map((r) => {
      return {
        url: r.getAs(query),
        locale: r.locale,
        isDefaultLocale: r.isDefaultLocale
      }
    })
  }

  getRequestHandler (app, customHandler) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      const { route, query, parsedUrl } = this.match(req.url)

      if (route) {
        req.locale = route.locale
        req.nextRoute = route
        req.siteName = this.siteName
        req.getMultilanguageUrls = () => this.getMultilanguageUrls(route, query)

        if (customHandler) {
          customHandler({ req, res, route, query })
        } else {
          app.render(req, res, route.page, query)
        }
      } else {
        if (req.url === '/' && this.forceLocale) {
          if (typeof res.redirect === 'function') {
            res.redirect(301, `/${this.locale}`)
          } else {
            res.writeHead(301, {
              'Location': `/${this.locale}`
            })
            res.end()
          }
        }
        nextHandler(req, res, parsedUrl)
      }
    }
  }

  getLink (Link) {
    const LinkRoutes = props => {
      const { href, locale, params, ...newProps } = props
      const locale2 = locale || this.locale
      const parsedUrl = parse(href)

      if (parsedUrl.hostname !== null || href[0] === '/' || href[0] === '#') {
        let propsToPass
        if (Link.propTypes) {
          const allowedKeys = Object.keys(Link.propTypes)
          propsToPass = allowedKeys.reduce((obj, key) => {
            props.hasOwnProperty(key) && (obj[key] = props[key])
            return obj
          }, {})
        } else {
          propsToPass = props
        }
        return <Link {...propsToPass} />
      }

      Object.assign(newProps, this.findAndGetUrls(href, locale2, params).urls)

      return <Link {...newProps} />
    }
    return LinkRoutes
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
