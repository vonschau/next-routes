/* global jest, describe, test, expect */
import ReactShallowRenderer from 'react-test-renderer/shallow'
import { Routes as nextRoutes } from '../src'
import { setupRoute, setupRouterMethods } from './helpers'
const renderer = new ReactShallowRenderer()

describe('Routes', () => {
  const setup = (...args) => {
    const { routes, route } = setupRoute(...args)
    const testRoute = expected => expect(route).toMatchObject(expected)
    return { routes, route, testRoute }
  }

  test('generate urls from params', () => {
    const { route } = setup('a', 'en', '/a/:b/:c+')
    const params = { b: 'b', c: [1, 2], d: 'd' }
    const expected = { as: '/a/b/1/2?d=d', href: '/a?b=b&c=1%2F2&d=d' }
    expect(route.getUrls(params)).toEqual(expected)
    expect(setup('a', 'en').route.getUrls()).toEqual({ as: '/a', href: '/a?' })
  })

  test('with custom Link and Router', () => {
    const CustomLink = () => <div />
    const CustomRouter = {}
    const { Link, Router } = nextRoutes({ Link: CustomLink, Router: CustomRouter }) // eslint-disable-line no-unused-vars
    expect(renderer.render(<Link href='/' />).type).toBe(CustomLink)
    expect(Router).toBe(CustomRouter)
  })
})

describe('Request handler', () => {
  const setup = url => {
    const routes = nextRoutes()
    const nextHandler = jest.fn()
    const app = { getRequestHandler: () => nextHandler, render: jest.fn() }
    return { app, routes, req: { url }, res: {} }
  }

  const setupForceLocale = (url, locale) => {
    const routes = nextRoutes({ locale, forceLocale: true })
    const nextHandler = jest.fn()
    const app = { getRequestHandler: () => nextHandler, render: jest.fn() }
    return { app, routes, req: { url }, res: {} }
  }

  test('can call res.redirect if req.url is equal to / when forcelocale is true', () => {
    const { routes, app, req, res } = setupForceLocale('/', 'it')
    res.redirect = jest.fn()
    routes.getRequestHandler(app)(req, res)
    expect(res.redirect).toBeCalledWith(301, '/it')
  })

  test('can call res.writeHead and res.end when req.url is equal to / and forcelocale is true if res.redirect not exist', () => {
    const { routes, app, req, res } = setupForceLocale('/', 'it')
    res.writeHead = jest.fn()
    res.end = jest.fn()
    routes.getRequestHandler(app)(req, res)
    expect(res.writeHead).toBeCalledWith(301, {
      'Location': '/it'
    })
  })

  test('find route and call render', () => {
    const { routes, app, req, res } = setup('/en/a')
    const { route, query } = routes.add('a', 'en').match('/en/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.render).toBeCalledWith(req, res, route.page, query)
  })

  test('find route and test locale is set correctly', () => {
    const routes = nextRoutes()
    const app = { getRequestHandler: jest.fn(), render: jest.fn() }
    const req = { url: '/cs/test' }

    routes.add('test', 'cs', '/test')
    routes.getRequestHandler(app)(req, {})
    expect(req.locale).toEqual('cs')
  })

  test('find route and call custom handler', () => {
    const { routes, app, req, res } = setup('/en/a')
    const { route, query } = routes.add('a', 'en').match('/en/a')
    const customHandler = jest.fn()
    const expected = expect.objectContaining({ req, res, route, query })
    routes.getRequestHandler(app, customHandler)(req, res)
    expect(customHandler).toBeCalledWith(expected)
  })

  test('find no route and call next handler', () => {
    const { routes, app, req, res } = setup('/en/a')
    const { parsedUrl } = routes.match('/en/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.getRequestHandler()).toBeCalledWith(req, res, parsedUrl)
  })
})

const routerMethods = ['push', 'replace', 'prefetch']

describe(`Router ${routerMethods.join(', ')}`, () => {

  test('with name and params', () => {
    const { route, testMethods } = setupRouterMethods(routerMethods,'a', 'en', '/a/:b')
    const { as, href } = route.getUrls({ b: 'b' })
    testMethods(['a', { b: 'b' }, 'en', {}], [href, as, {}])
  })
})
