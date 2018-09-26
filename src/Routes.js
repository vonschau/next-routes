import { parse } from 'url'
import pick from 'lodash.pick'
import NextLink from 'next/link'
import NextRouter from 'next/router'
import Route from './Route'
import { generateRouteFromObjectName, redirectToLocalizedHome } from './helpers/routeHelper'
import MiddlewareManager from './middleware/MiddlewareManager'

export default class Routes {
  constructor({ Link = NextLink, Router = NextRouter, locale, forceLocale = false, siteUrl } = {}) {
    this.routes = []
    this.Link = this.getLink(Link)
    this.Router = this.getRouter(Router)
    this.locale = locale
    this.forceLocale = forceLocale
    this.siteUrl = siteUrl
  }

  add(name, locale = this.locale, pattern, page, data, update = false) {
    let options
    if (name instanceof Object) {
      options = generateRouteFromObjectName(name)
    } else {
      if (typeof page === 'object') {
        options = { data: page, page: name, pattern, locale, name }
      } else {
        options = { data, page: page || name, pattern, locale, name }
      }
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

  middleware(functions = []) {
    if (!functions || !Array.isArray(functions)) {
      throw new Error('props must be an array')
    }

    const lastRoute = this.routes[this.routes.length - 1]

    functions.forEach((middleware, index) => {
      if (typeof middleware !== 'function') {
        throw new Error(`middlewate at position ${index} is not a function`)
      }
    })

    lastRoute.setMiddlewares(functions)
    return this
  }

  setLocale(locale) {
    this.locale = locale
  }

  findByName(name, locale = this.locale) {
    if (name) {
      return this.routes.filter(route => route.name === name && route.locale === locale)[0] || false
    }
  }

  match(url) {
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

  findAndGetUrls(name, locale = this.locale, params = {}) {
    const locl = locale || this.locale
    const route = this.findByName(name, locl)

    if (route) {
      return { route, urls: route.getUrls(params), byName: true }
    }
    throw new Error(`Route "${name}" not found`)

  }

  getMultilanguageUrls(route, query) {
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

  getRequestHandler(app, customHandler) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      const { route, query, parsedUrl } = this.match(req.url)

      if (route) {
        req.locale = route.locale
        req.nextRoute = route
        req.siteUrl = this.siteUrl
        req.getMultilanguageUrls = () => this.getMultilanguageUrls(route, query)

        MiddlewareManager(route.middlewares, { req, res, route, query })((err, data) => {
          if (err) throw err

          req.nextData = data
        })

        renderRoute(app, customHandler, { req, res, route, query })
        return
      }

      if (req.url === '/' && this.forceLocale) {
        redirectToLocalizedHome(res, this.locale)
        return
      }

      nextHandler(req, res, parsedUrl)
    }
  }

  getLink(Link) {
    const LinkRoutes = props => {
      const { href, locale = this.locale, route, params, ...newProps } = props
      const { hostname } = href ? parse(href) : {}
      const firstRef = href && href[0]
      const mustPassProps = hostname || ['/', '#'].includes(firstRef)
      let propsToPass

      if (mustPassProps) {
        const { propTypes } = Link
        const ownProps = propTypes && pick(props, Object.keys(props))
        propsToPass = propTypes ? pick(ownProps, Object.keys(propTypes)) : props
      }
      else {
        const { urls } = this.findAndGetUrls(route, locale, params)
        propsToPass = { ...newProps, ...urls }
      }

      return <Link {...propsToPass} />
    }
    return LinkRoutes
  }

  getRouter(Router) {
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

const renderRoute = (app, customHandler, { req, res, route, query }) => {
  if (customHandler) {
    customHandler({ req, res, route, query })
  } else {
    app.render(req, res, route.page, query)
  }
}
