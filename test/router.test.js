/* global jest, describe, test, expect */
import { Routes as nextRoutes } from '../src'

const setupRoute = (...args) => {
  const routes = nextRoutes({locale: 'en'}).add(...args)
  const route = routes.routes[routes.routes.length - 1]
  return {routes, route}
}

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
})
