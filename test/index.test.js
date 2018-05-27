/* global jest, describe, test, expect */
import React from 'react'
import ReactShallowRenderer from 'react-test-renderer/shallow'
import nextRoutes from '../src'

const renderer = new ReactShallowRenderer()

const setupRoute = (...args) => {
  const routes = nextRoutes({ locale: 'en' }).add(...args)
  const route = routes.routes[routes.routes.length - 1]
  return { routes, route }
}

describe('Routes', () => {
  const setup = (...args) => {
    const { routes, route } = setupRoute(...args)
    const testRoute = expected => expect(route).toMatchObject(expected)
    return { routes, route, testRoute }
  }

  test('generate urls from params', () => {
    const { route } = setup('a', 'en', '/a/:b/:c+')
    const params = { b: 'b', c: [1, 2], d: 'd' }
    const expected = { as: '/en/a/b/1/2?d=d', href: '/a?b=b&c=1%2F2&d=d' }
    expect(route.getUrls(params)).toEqual(expected)
    expect(setup('a', 'en').route.getUrls()).toEqual({ as: '/en/a', href: '/a?' })
  })

  test('with custom Link and Router', () => {
    const CustomLink = () => <div />
    const CustomRouter = {}
    const { Link, Router } = nextRoutes({ Link: CustomLink, Router: CustomRouter })
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
  const setup = (...args) => {
    const { routes, route } = setupRoute(...args)
    const testMethods = (args, expected) => {
      routerMethods.forEach(method => {
        const Router = routes.getRouter({ [method]: jest.fn() })
        Router[`${method}Route`](...args)
        expect(Router[method]).toBeCalledWith(...expected)
      })
    }
    const testException = (args) => {
      routerMethods.forEach(method => {
        const Router = routes.getRouter({ [method]: jest.fn() })
        expect(() => Router[`${method}Route`](...args)).toThrow()
      })
    }
    return { routes, route, testMethods, testException }
  }

  test('with name and params', () => {
    const { route, testMethods } = setup('a', 'en', '/a/:b')
    const { as, href } = route.getUrls({ b: 'b' })
    testMethods(['a', { b: 'b' }, 'en', {}], [href, as, {}])
  })
})
