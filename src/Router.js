import NextRouter from 'next/router'

export default class Router extends NextRouter {
  static lastAs

  async change (method, _url, _as, options) {
    Router.lastAs = _as
    super.change(method, _url, _as, options)
  }

  urlIsNew (pathname, query) {
    return super.urlIsNew(pathname, query) || Router.lastAs !== this.asPath
  }
}
