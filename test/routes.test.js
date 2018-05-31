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
    const routes = nextRoutes({ locale: 'it', forceLocale: true })
      .add('home', 'it', '/(.*)/:slug', 'homepage')
      .add('home', 'en', '/(.*)/:slug', 'homepage')

    const result = routes.match('/en/hello/world')
    expect(result.route.locale).toBe('en')
    expect(result.parsedUrl.path).toBe('/en/hello/world')
  })

  test('should return object without route if route called not have lang on url when settings have forceLocale true', () => {
    const routes = nextRoutes({ locale: 'it', forceLocale: true })
      .add('home', 'it', '/(.*)/:slug', 'homepage')
      .add('home', 'en', '/(.*)/:slug', 'homepage')

    const result = routes.match('/hello/world')
    expect(result).not.toHaveProperty('route')
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
    const router = nextRoutes({ locale: 'en' }).add('a', 'en', '/:a', 'b', data)
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

describe('setLocale()', () => {
  test('change locale routes', () => {
    const routes = nextRoutes({ locale: 'it' })

    expect(routes.locale).toBe('it')
    routes.setLocale('fr')
    expect(routes.locale).toBe('fr')
  })
})

describe('findByName', () => {
  test('can return route with default locale found by name', () => {
    const routes = nextRoutes({ locale: 'it' })
    routes.add('news', 'en', '/news', 'newsList')
    routes.add('news', 'it', '/notizie', 'newsList')

    const result = routes.findByName('news')

    expect(result.name).toBe('news')
    expect(result.locale).toBe('it')
    expect(result.pattern).toBe('/notizie')
  })

  test('can return route with specific locale found by name', () => {
    const routes = nextRoutes({ locale: 'it' })
    routes.add('news', 'en', '/news', 'newsList')
    routes.add('news', 'it', '/notizie', 'newsList')

    const result = routes.findByName('news', 'en')

    expect(result.name).toBe('news')
    expect(result.locale).toBe('en')
    expect(result.pattern).toBe('/news')
  })

  test('can return false if route searched not exist', () => {
    const routes = nextRoutes({ locale: 'it' })
    routes.add('news', 'en', '/news', 'newsList')
    routes.add('news', 'it', '/notizie', 'newsList')

    const result = routes.findByName('pdoor', 'en')
    expect(result).toBeFalsy()
  })
})

describe('findAndGetUrls', () => {
  test('can return route object with url for default locale found by name', () => {
    const routes = nextRoutes({ locale: 'it' })
    routes.add('news', 'en', '/news', 'newsList')
    routes.add('news', 'it', '/notizie', 'newsList')

    const result = routes.findAndGetUrls('news')
    expect(result.urls.as).toBe('/notizie')
  })

  test('can return route object with url for specific locale found by namee', () => {
    const routes = nextRoutes({ locale: 'it' })
    routes.add('news', 'en', '/news', 'newsList')
    routes.add('news', 'it', '/notizie', 'newsList')

    const result = routes.findAndGetUrls('news', 'en')
    expect(result.urls.as).toBe('/en/news')
  })

  test('can thrown exception if route not exist', () => {
    const routes = nextRoutes({ locale: 'it' })
    routes.add('news', 'en', '/news', 'newsList')
    routes.add('news', 'it', '/notizie', 'newsList')

    expect(() => {
      routes.findAndGetUrls('pdoor', 'fr')
    }).toThrow()
  })
})
