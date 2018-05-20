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
})

describe('add()', () => {
  test('should generate route on default locale', () => {
    const routes = nextRoutes({ locale: 'it' })
      .add('home', 'en', '/', 'homepage')

    expect(routes.routes[0].isDefaultLocale).toBeFalsy()
  })
})
