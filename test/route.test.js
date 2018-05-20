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

// describe('match', () => {
//   it('can return empty object if route not match pattern', () => {
//     const routeData = { name: 'home', locale: 'it', pattern: '/', page: 'home' }
//     const route = new Route(routeData)
//     console.log(route.match('/it'))
//   })
// })
