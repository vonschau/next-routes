import * as pathToRegexp from 'path-to-regexp'
interface Option {
  name: string
  page: string
  locale: string
  pattern: string
  data?: any
}
export default class Route {
  public name: string
  public locale: string
  public pattern: string
  public page: string
  public regex: RegExp
  public keys: Array<{
    name: string
  }>
  public keyNames: string[]
  public toPath: pathToRegexp.PathFunction
  public data: object
  constructor({ name, locale, pattern, page, data }: Option)
  public match(
    path: string
  ):
    | {
        [key: string]: string
      }
    | undefined
  public valuesToParams(
    values: string[]
  ): {
    [key: string]: string
  }
  public getHref(params?: any): string
  public getAs(params?: any): string
  public getUrls(
    params: any
  ): {
    as: string
    href: string
  }
}
export {}
