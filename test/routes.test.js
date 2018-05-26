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
})

describe('add()', () => {
  test('should generate route on default locale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'en', '/', 'homepage')

    expect(routes.routes[0].isDefaultLocale).toBeFalsy()
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
