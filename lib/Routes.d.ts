import NextLink from 'next/link'
import NextRouter from 'next/router'
import * as React from 'react'
import Route from './Route'
declare type RouterType = typeof NextRouter & {
  pushRoute: (route: string, params: any, locale: string, options: any) => void
  replaceRoute: (
    route: string,
    params: any,
    locale: string,
    options: any
  ) => void
  prefetchRoute: (
    route: string,
    params: any,
    locale: string,
    options: any
  ) => void
}
interface ConstructorProps {
  Link?: any
  Router?: any
  locale: string
}
interface Option {
  name: string
  page: string
  locale: string
  pattern: string
  data?: any
}
export default class Routes {
  public routes: Route[]
  public Link: React.ReactNode
  public Router: RouterType
  public locale: string
  constructor({ Link, Router, locale }: ConstructorProps)
  public add(
    name: string | Option,
    locale: string | undefined,
    pattern: string,
    page: string,
    data?: any
  ): this
  public setLocale(locale: string): void
  public findByName(name: string, locale: string): Route | undefined
  public match(
    url: string
  ): {
    query: any
    route?: Route | undefined
    params?: any
    parsedUrl: any
  }
  public findAndGetUrls(
    nameOrUrl: string,
    locale: string,
    params: any
  ):
    | {
        foundRoute: Route
        urls: {
          as: string
          href: string
        }
        byName: boolean
        route?: undefined
      }
    | {
        route: Route | undefined
        urls: {
          href: string
          as: string
        }
        foundRoute?: undefined
        byName?: undefined
      }
  public getRequestHandler(
    app: any,
    customHandler?: any
  ): (req: any, res: any) => void
  public getLink(Link: typeof NextLink): (props: any) => JSX.Element
  public getRouter(Router: RouterType): RouterType
}
export {}
