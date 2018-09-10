/* global jest, describe, test, expect */
import { setupRouterMethods } from './helpers'

const routerMethods = ['push', 'replace', 'prefetch']

describe(`Router ${routerMethods.join(', ')}`, () => {

  test('with name and params', () => {
    const { route, testMethods } = setupRouterMethods(routerMethods, 'a', 'en', '/a/:b')
    const { as, href } = route.getUrls({ b: 'b' })
    testMethods(['a', { b: 'b' }, 'en', {}], [href, as, {}])
  })
})
