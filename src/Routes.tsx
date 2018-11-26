import NextLink, { LinkProps } from 'next/link'
import NextRouter, { SingletonRouter } from 'next/router'
import * as React from 'react'
import { parse } from 'url'

import Route, { Options as RouteOptions } from './Route'

interface NextRouteOptions {
  shallow: boolean
}

type FnType = (
  route: string,
  params?: any,
  localeOrOptions?: string | NextRouteOptions,
  options?: NextRouteOptions
) => void

interface RouterType extends SingletonRouter {
  pushRoute: FnType
  replaceRoute: FnType
  prefetchRoute: FnType
}

interface ExtendedLinkProps extends LinkProps {
  route: string
  locale?: string
  to?: string
  params?: any
}
type LinkType = React.SFC<ExtendedLinkProps>

interface ConstructorProps {
  Link?: any
  Router?: any
  locale: string
}

export default class Routes {
  public routes: Route[]
  public Link: LinkType
  public Router: RouterType
  public locale: string

  constructor({ locale }: ConstructorProps) {
    this.routes = []
    this.Link = this.getLink(NextLink)
    this.Router = this.getRouter(NextRouter as RouterType)
    this.locale = locale
  }

  public add(
    name: string,
    locale: string = this.locale,
    pattern: string,
    page: string | RouteOptions,
    options?: RouteOptions
  ) {
    if (typeof page === 'object') {
      options = page
      page = name
    }
    const routeParams = { name, locale, pattern, page: page || name, options }

    if (this.findByName(name, locale)) {
      throw new Error(`Route "${name}" already exists`)
    }
    this.routes.push(new Route(routeParams))
    return this
  }

  public setLocale(locale: string) {
    this.locale = locale
  }

  public findByName(name: string, locale?: string) {
    locale = locale || this.locale
    if (name) {
      return this.routes.filter(
        route => route.name === name && route.locale === locale
      )[0]
    }
    return undefined
  }

  public match(url: string) {
    const parsedUrl = parse(url, true)
    const { pathname, query } = parsedUrl

    return this.routes.reduce(
      (result, route) => {
        if (result.route) {
          return result
        }
        const params = route.match(pathname!)
        if (!params) {
          return result
        }
        return { ...result, route, params, query: { ...query, ...params } }
      },
      { query, parsedUrl } as {
        query: any
        route?: Route
        params?: any
        parsedUrl: any
      }
    )
  }

  public findAndGetUrls(nameOrUrl: string, locale: string, params: any) {
    locale = locale || this.locale
    const foundRoute = this.findByName(nameOrUrl, locale)

    if (foundRoute) {
      return { foundRoute, urls: foundRoute.getUrls(params), byName: true }
    } else {
      const { route, query } = this.match(nameOrUrl)
      const href = route ? route.getHref(query) : nameOrUrl
      const urls = { href, as: nameOrUrl }
      return { route, urls }
    }
  }

  public getRequestHandler(app: any, customHandler?: any) {
    const nextHandler = app.getRequestHandler()

    return (req: any, res: any) => {
      const { route, query, parsedUrl } = this.match(req.url)

      if (route) {
        req.locale = route.locale

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

  public getLink(Link: typeof NextLink) {
    const LinkRoutes: React.SFC<ExtendedLinkProps> = props => {
      const { route, params, locale, to, ...newProps } = props
      const nameOrUrl = route || to

      const locale2 = locale || this.locale

      if (nameOrUrl) {
        Object.assign(
          newProps,
          this.findAndGetUrls(nameOrUrl, locale2, params).urls
        )
      }

      return <Link {...newProps} />
    }

    return LinkRoutes
  }

  public getRouter(Router: RouterType) {
    const wrap = (method: string) => (
      route: string,
      params: any,
      locale: string | NextRouteOptions,
      options: NextRouteOptions
    ) => {
      const locale2 = typeof locale === 'string' ? locale : this.locale
      const options2 = typeof locale === 'object' ? locale : options

      const {
        byName,
        urls: { as, href }
      } = this.findAndGetUrls(route, locale2, params)
      return Router[method](href, as, byName ? options2 : params)
    }

    Router.pushRoute = wrap('push')
    Router.replaceRoute = wrap('replace')
    Router.prefetchRoute = wrap('prefetch')

    return Router
  }
}
