/* global describe, test, expect */
import nextRoutes from './../src'

describe('match()', () => {
  test('should return route with locale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'en', '/', 'homepage')
      .add('home', 'it', '/', 'homepage')

    const result = routes.match('/')
    expect(result.route.locale).toBe('it')
    expect(result.parsedUrl.path).toBe('/')
  })

  test('should return route with alternative locale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'en', '/', 'homepage')
      .add('home', 'it', '/', 'homepage')

    const result = routes.match('/en')
    expect(result.route.locale).toBe('en')
    expect(result.parsedUrl.path).toBe('/en')
  })

  test('should match exact route when route is generated with forceLocale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'it', '/(.*)/:slug', 'homepage')
      .add('home', 'en', '/(.*)/:slug', 'homepage', {}, false, true)

    const result = routes.match('/en/hello/world')
    expect(result.route.locale).toBe('en')
    expect(result.parsedUrl.path).toBe('/en/hello/world')
  })


  test('match and merge params into query', () => {
    const routes = nextRoutes().add('a', 'en', '/').add('b', 'en', '/b/:b').add('c', 'en', '/c')
    expect(routes.match('/en/b/b?b=x&c=c').query).toMatchObject({ b: 'b', c: 'c' })
  })

  test('match homepage route', () => {
    const routes = nextRoutes({ locale: 'en' }).add('homepage', 'en')
    expect(routes.match('/en').route.locale).toBe('en')
    expect(routes.match('/en').parsedUrl.path).toBe('/en')
  })
})

describe('add()', () => {

  test('page with leading slash', () => {
    const routes = nextRoutes({ locale: 'it' }).add('a', 'en', '/', '/b')
    expect(routes.routes[0]).toMatchObject({ page: '/b' })
  })

  test('homepage becomes empty url', () => {
    const routes = nextRoutes({ locale: 'it' }).add('homepage', 'en', '')
    expect(routes.routes[0]).toMatchObject({ pattern: '' })
  })

  test('should generate route on default locale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'en', '/', 'homepage')

    expect(routes.routes[0].isDefaultLocale).toBeFalsy()
  })

  test('add with object', () => {
    const router = nextRoutes({ locale: 'en' }).add({ name: 'a', locale: 'en' })
    expect(router.routes[0]).toMatchObject({ name: 'a', locale: 'en', pattern: '/a', page: '/a' })
  })

  test('add with object and data', () => {
    const data = { contentItemId: 'test' }
    const router = nextRoutes({ locale: 'en' }).add({ name: 'a', locale: 'en', data: data })
    expect(router.routes[0]).toMatchObject({
        name: 'a',
        locale: 'en',
        pattern: '/a',
        page: '/a',
        data: data
      })
  })

  test('add with name and pattern', () => {
    const router = nextRoutes({ locale: 'en' }).add('a', 'en', '/:a')
    expect(router.routes[0]).toMatchObject({ name: 'a', locale: 'en', pattern: '/:a', page: '/a' })
  })

  test('add with name, pattern and data', () => {
    const data = { contentItemId: 'test' }
    const router = nextRoutes({ locale: 'en' }).add('a', 'en', '/:a', data)
    expect(router.routes[0]).toMatchObject({ name: 'a', locale: 'en', pattern: '/:a', page: '/a', data: data })
  })

  test('add with name, pattern and page', () => {
    const router = nextRoutes({ locale: 'en' }).add('a', 'en', '/:a', 'b')
    expect(router.routes[0]).toMatchObject({ name: 'a', locale: 'en', pattern: '/:a', page: '/b' })
  })

  test('add with name, pattern,page and data', () => {
    const data = { contentItemId: 'test' }
    const router =  nextRoutes({ locale: 'en' }).add('a', 'en', '/:a', 'b', data)
   expect(router.routes[0]).toMatchObject({ name: 'a', locale: 'en', pattern: '/:a', page: '/b', data: data })
  })

  test('add with existing name throws', () => {
    expect(() => nextRoutes().add('a', 'en').add('a', 'en')).toThrow()
  })

  test('update with object', () => {
    const data = { contentItemId: 'test' }
    const routes = nextRoutes({ locale: 'en' })
    routes.add({ name: 'a', locale: 'en', page: 'b', data: data })
    routes.add({ name: 'a', locale: 'en', page: 'c', data: data, update: true })
    const route = routes.routes[routes.routes.length - 1]
    expect(route).toMatchObject({ name: 'a', locale: 'en', pattern: '/a', page: '/c', data: data })
  })

  test('update with params', () => {
    const data = { contentItemId: 'test' }
    const routes = nextRoutes({ locale: 'en' })
    routes.add('a', 'en', '/:a', 'b', data)
    routes.add('a', 'en', '/:a', 'c', data, true)
    const route = routes.routes[routes.routes.length - 1]
    expect(route).toMatchObject({ name: 'a', locale: 'en', pattern: '/:a', page: '/c', data: data })
  })
})


describe('sort routes', () => {
  test('routes should be ordered by forceLocale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'it', '/', 'homepage')
      .add('news', 'en', '/', 'newsList', {}, false, true)

    expect(routes.routes[0].name).toBe('news')
    expect(routes.routes[0].locale).toBe('en')
    expect(routes.routes[0].forceLocale).toBeTruthy()
  })
})

describe('setLocale()', () => {
  test('change locale routes', () => {
    const routes = nextRoutes({ locale: 'it' })

    expect(routes.locale).toBe('it')
    routes.setLocale('fr')
    expect(routes.locale).toBe('fr')
  })
})
