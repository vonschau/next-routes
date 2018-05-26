/* global describe, test, expect */
import Route from './../src/Route'

describe('constructor', () => {
  test('generate regex with optional lang inside', () => {
    const routeData = { name: 'home', locale: 'it', page: 'home', pattern: '/', isDefaultLocale: true }
    const route = new Route(routeData)

    expect(route.regex.exec('/')).toBeInstanceOf(Array)
    expect(route.regex.exec('/it/')).toBeInstanceOf(Array)
    expect(route.regex.exec('/en/')).toBe(null)
  })
})

describe('match', () => {
  test('match route after generated with forceLocale', () => {
    const routeData = { name: 'home', locale: 'it', page: 'home', pattern: '/', forceLocale: true }
    const route = new Route(routeData)

    expect(route.match('/en/')).toBe(undefined)
    expect(route.match('/it/')).toEqual({ locale: 'it' })
    expect(route.match('/it')).toEqual({ locale: 'it' })
  })
})
