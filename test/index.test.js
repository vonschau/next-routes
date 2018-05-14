/* global jest, describe, test, expect */
import React from 'react'
import ReactShallowRenderer from 'react-test-renderer/shallow'
import nextRoutes from '../src'

const renderer = new ReactShallowRenderer()

const setupRoute = (...args) => {
  const routes = nextRoutes({locale: 'en'}).add(...args)
  const route = routes.routes[routes.routes.length - 1]
  return {routes, route}
}

describe('Routes', () => {
  const setup = (...args) => {
    const {routes, route} = setupRoute(...args)
    const testRoute = expected => expect(route).toMatchObject(expected)
    return {routes, route, testRoute}
  }

  test('add with object', () => {
    setup({name: 'a', locale: 'en'}).testRoute({name: 'a', locale: 'en', pattern: '/a', page: '/a'})
  })

  test('add with object and data', () => {
    const data = {contentItemId: 'test'}
    setup({name: 'a', locale: 'en', data: data})
      .testRoute({
        name: 'a',
        locale: 'en',
        pattern: '/a',
        page: '/a',
        data: data
      })
  })

  test('add with name and pattern', () => {
    setup('a', 'en', '/:a').testRoute({name: 'a', locale: 'en', pattern: '/:a', page: '/a'})
  })

  test('add with name, pattern and data', () => {
    const data = {contentItemId: 'test'}
    setup('a', 'en', '/:a', data).testRoute({name: 'a', locale: 'en', pattern: '/:a', page: '/a', data: data})
  })

  test('add with name, pattern and page', () => {
    setup('a', 'en', '/:a', 'b').testRoute({name: 'a', locale: 'en', pattern: '/:a', page: '/b'})
  })

  test('add with name, pattern,page and data', () => {
    const data = {contentItemId: 'test'}
    setup('a', 'en', '/:a', 'b', data).testRoute({name: 'a', locale: 'en', pattern: '/:a', page: '/b', data: data})
  })

  test('add with existing name throws', () => {
    expect(() => nextRoutes().add('a', 'en').add('a', 'en')).toThrow()
  })

  test('update with object', () => {
    const data = {contentItemId: 'test'}
    const routes = nextRoutes({locale: 'en'})
    routes.add({name: 'a', locale: 'en', page: 'b', data: data})
    routes.add({name: 'a', locale: 'en', page: 'c', data: data, update: true})
    const route = routes.routes[routes.routes.length - 1]
    expect(route).toMatchObject({name: 'a', locale: 'en', pattern: '/a', page: '/c', data: data})
  })

  test('update with params', () => {
    const data = {contentItemId: 'test'}
    const routes = nextRoutes({locale: 'en'})
    routes.add('a', 'en', '/:a', 'b', data)
    routes.add('a', 'en', '/:a', 'c', data, true)
    const route = routes.routes[routes.routes.length - 1]
    expect(route).toMatchObject({name: 'a', locale: 'en', pattern: '/:a', page: '/c', data: data})
  })

  test('page with leading slash', () => {
    setup('a', 'en', '/', '/b').testRoute({page: '/b'})
  })

  test('homepage becomes empty url', () => {
    setup('homepage', 'en', '').testRoute({pattern: ''})
  })

  test('match and merge params into query', () => {
    const routes = nextRoutes().add('a', 'en').add('b', 'en', '/b/:b').add('c', 'en')
    expect(routes.match('/en/b/b?b=x&c=c').query).toMatchObject({b: 'b', c: 'c'})
  })

  test('match homepage route', () => {
    const {routes, route} = setupRoute('homepage', 'en')
    expect(routes.match('/en').route).toMatchObject(route)
  })

  test('generate urls from params', () => {
    const {route} = setup('a', 'en', '/a/:b/:c+')
    const params = {b: 'b', c: [1, 2], d: 'd'}
    const expected = {as: '/en/a/b/1/2?d=d', href: '/a?b=b&c=1%2F2&d=d'}
    expect(route.getUrls(params)).toEqual(expected)
    expect(setup('a', 'en').route.getUrls()).toEqual({as: '/en/a', href: '/a?'})
  })

  test('with custom Link and Router', () => {
    const CustomLink = () => <div />
    const CustomRouter = {}
    const {Link, Router} = nextRoutes({Link: CustomLink, Router: CustomRouter})
    expect(renderer.render(<Link href='/' />).type).toBe(CustomLink)
    expect(Router).toBe(CustomRouter)
  })
})

describe('Request handler', () => {
  const setup = url => {
    const routes = nextRoutes()
    const nextHandler = jest.fn()
    const app = {getRequestHandler: () => nextHandler, render: jest.fn()}
    return {app, routes, req: {url}, res: {}}
  }

  test('find route and call render', () => {
    const {routes, app, req, res} = setup('/en/a')
    const {route, query} = routes.add('a', 'en').match('/en/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.render).toBeCalledWith(req, res, route.page, query)
  })

  test('find route and test locale is set correctly', () => {
    const routes = nextRoutes()
    const app = {getRequestHandler: jest.fn(), render: jest.fn()}
    const req = {url: '/cs/test'}

    routes.add('test', 'cs', '/test')
    routes.getRequestHandler(app)(req, {})
    expect(req.locale).toEqual('cs')
  })

  test('find route and call custom handler', () => {
    const {routes, app, req, res} = setup('/en/a')
    const {route, query} = routes.add('a', 'en').match('/en/a')
    const customHandler = jest.fn()
    const expected = expect.objectContaining({req, res, route, query})
    routes.getRequestHandler(app, customHandler)(req, res)
    expect(customHandler).toBeCalledWith(expected)
  })

  test('find no route and call next handler', () => {
    const {routes, app, req, res} = setup('/en/a')
    const {parsedUrl} = routes.match('/en/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.getRequestHandler()).toBeCalledWith(req, res, parsedUrl)
  })
})

const routerMethods = ['push', 'replace', 'prefetch']

describe(`Router ${routerMethods.join(', ')}`, () => {
  const setup = (...args) => {
    const {routes, route} = setupRoute(...args)
    const testMethods = (args, expected) => {
      routerMethods.forEach(method => {
        const Router = routes.getRouter({[method]: jest.fn()})
        Router[`${method}Route`](...args)
        expect(Router[method]).toBeCalledWith(...expected)
      })
    }
    const testException = (args) => {
      routerMethods.forEach(method => {
        const Router = routes.getRouter({[method]: jest.fn()})
        expect(() => Router[`${method}Route`](...args)).toThrow()
      })
    }
    return {routes, route, testMethods, testException}
  }

  test('with name and params', () => {
    const {route, testMethods} = setup('a', 'en', '/a/:b')
    const {as, href} = route.getUrls({b: 'b'})
    testMethods(['a', {b: 'b'}, 'en', {}], [href, as, {}])
  })
/*
  test('with route not found', () => {
    setup('a', 'en').testException(['/b', 'en', {}])
  })
*/
})
