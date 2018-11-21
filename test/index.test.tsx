import NextLink from 'next/link'
import * as React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'
import nextRoutes from '../src'

const renderer = createRenderer()

const setupRoute = (...args: any[]) => {
  const routes = (nextRoutes({ locale: 'en' }) as any).add(...args)
  const route = routes.routes[routes.routes.length - 1]
  return { routes, route }
}

describe('Routes', () => {
  const setup = (...args: any[]) => {
    const { routes, route } = setupRoute(...args)
    const testRoute = (expected: any) => expect(route).toMatchObject(expected)
    return { routes, route, testRoute }
  }

  test('add with object', () => {
    setup({ name: 'a', locale: 'en' }).testRoute({
      name: 'a',
      locale: 'en',
      pattern: '/a',
      page: '/a'
    })
  })

  test('add with object and data', () => {
    const data = { contentItemId: 'test' }
    setup({ name: 'a', locale: 'en', data }).testRoute({
      name: 'a',
      locale: 'en',
      pattern: '/a',
      page: '/a',
      data
    })
  })

  test('add with name and pattern', () => {
    setup('a', 'en', '/:a').testRoute({
      name: 'a',
      locale: 'en',
      pattern: '/:a',
      page: '/a'
    })
  })

  test('add with name, pattern and data', () => {
    const data = { contentItemId: 'test' }
    setup('a', 'en', '/:a', data).testRoute({
      name: 'a',
      locale: 'en',
      pattern: '/:a',
      page: '/a',
      data
    })
  })

  test('add with name, pattern and page', () => {
    setup('a', 'en', '/:a', 'b').testRoute({
      name: 'a',
      locale: 'en',
      pattern: '/:a',
      page: '/b'
    })
  })

  test('add with name, pattern,page and data', () => {
    const data = { contentItemId: 'test' }
    setup('a', 'en', '/:a', 'b', data).testRoute({
      name: 'a',
      locale: 'en',
      pattern: '/:a',
      page: '/b',
      data
    })
  })

  test('add with existing name throws', () => {
    expect(() =>
      nextRoutes({ locale: 'en' })
        .add('a', 'en', 'pattern', 'page')
        .add('a', 'en', 'pattern', 'page')
    ).toThrow()
  })

  test('page with leading slash', () => {
    setup('a', 'en', '/', '/b').testRoute({ page: '/b' })
  })

  test('homepage becomes empty url', () => {
    setup('homepage', 'en', '').testRoute({ pattern: '' })
  })

  test('match and merge params into query', () => {
    const routes = nextRoutes({ locale: 'en' })
      .add('a', 'en', 'pattern', 'page')
      .add('b', 'en', '/b/:b', 'page')
      .add('c', 'en', 'pattern', 'page')
    expect(routes.match('/b/b?b=x&c=c').query).toMatchObject({ b: 'b', c: 'c' })
  })

  test('match homepage route', () => {
    const { routes, route } = setupRoute('homepage', 'en')
    expect(routes.match('/').route).toMatchObject(route)
  })

  test('generate urls from params', () => {
    const { route } = setup('a', 'en', '/a/:b/:c+')
    const params = { b: 'b', c: [1, 2], d: 'd' }
    const expected = { as: '/a/b/1/2?d=d', href: '/a?b=b&c=1%2F2&d=d' }
    expect(route.getUrls(params)).toEqual(expected)
    expect(setup('a', 'en').route.getUrls()).toEqual({ as: '/a', href: '/a?' })
  })
})

describe('Request handler', () => {
  const setup = (url: string) => {
    const routes = nextRoutes({ locale: 'en' })
    const nextHandler = jest.fn()
    const app = { getRequestHandler: () => nextHandler, render: jest.fn() }
    return { app, routes, req: { url }, res: {} }
  }

  test('find route and call render', () => {
    const { routes, app, req, res } = setup('/en-gb/a')
    const { route, query } = routes
      .add('test', 'en-gb', '/en-gb/a', 'page')
      .match('/en-gb/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.render).toBeCalledWith(req, res, route!.page, query)
  })

  test('find route and test locale is set correctly', () => {
    const routes = nextRoutes({ locale: 'en' })
    const app = { getRequestHandler: jest.fn(), render: jest.fn() }
    const req = { url: '/cs/test' } as any

    routes.add('test', 'cs', '/cs/test', 'page')
    routes.getRequestHandler(app)(req, {})
    expect(req.locale).toEqual('cs')
  })

  test('find route and call custom handler', () => {
    const { routes, app, req, res } = setup('/en-us/a')
    const { route, query } = routes
      .add('a', 'en-us', '/en-us/a', 'page')
      .match('/en-us/a')
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

describe('Link', () => {
  const setup = (...args: any[]) => {
    const { routes, route } = setupRoute(...args)
    const { Link } = routes
    const props = { children: <a>hello</a> }
    const testLink = (addProps: any, expected: any) => {
      const actual = renderer.render(<Link {...props} {...addProps} />) as any
      expect(actual.type).toBe(NextLink)
      expect(actual.props).toEqual({ ...props, ...expected })
    }
    return { routes, route, testLink }
  }

  test('with filtered params', () => {
    const { testLink } = setup('a', 'en', '/a/:b')
    testLink({ href: '/', params: { b: 'b' } }, { href: '/' })
  })

  test('with name and params', () => {
    const { route, testLink } = setup('a', 'en', '/a/:b')
    testLink({ route: 'a', params: { b: 'b' } }, route.getUrls({ b: 'b' }))
  })

  test('with route not found', () => {
    const { testLink } = setup('a', 'en')
    testLink({ href: 'b' }, { href: 'b' })
  })
})

const routerMethods = ['push', 'replace', 'prefetch']

describe(`Router ${routerMethods.join(', ')}`, () => {
  const setup = (...args: any[]) => {
    const { routes, route } = setupRoute(...args)
    const testMethods = (otherArgs: any[], expected: any) => {
      routerMethods.forEach(method => {
        const Router = routes.getRouter({ [method]: jest.fn() })
        Router[`${method}Route`](...otherArgs)
        expect(Router[method]).toBeCalledWith(...expected)
      })
    }
    return { routes, route, testMethods }
  }

  test('with name and params', () => {
    const { route, testMethods } = setup('a', 'en', '/a/:b')
    const { as, href } = route.getUrls({ b: 'b' })
    testMethods(['a', { b: 'b' }, 'en', {}], [href, as, {}])
  })

  test('with options and without locale', () => {
    const { route, testMethods } = setup('a', 'en', '/a/:b')
    const { as, href } = route.getUrls({ b: 'b' })
    testMethods(
      ['a', { b: 'b' }, { shallow: true }],
      [href, as, { shallow: true }]
    )
  })
})
