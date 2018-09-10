/* global describe, test, expect */
import NextLink from 'next/link'
import ReactShallowRenderer from 'react-test-renderer/shallow'
import { setupRoute } from './helpers'

const renderer = new ReactShallowRenderer()


describe('Link', () => {
  const setup = (...args) => {
    const { routes, route } = setupRoute(...args)
    const props = { children: <a>hello</a> }
    const { Link } = routes // eslint-disable-line no-unused-vars
    const testLink = (addProps, expected) => {
      const actual = renderer.render(<Link {...props} {...addProps} />)
      expect(actual.type).toBe(NextLink)
      expect(actual.props).toEqual({ ...props, ...expected })
    }
    const testLinkException = (addProps) => {
      expect(() => renderer.render(<Link {...props} {...addProps} />)).toThrow()
    }
    return { routes, route, testLink, testLinkException }
  }

  test('with filtered params', () => {
    const { testLink } = setup('a', 'en', '/a/:b')
    testLink({ href: '/', params: { b: 'b' } }, { href: '/' })
  })

  test('with name and params', () => {
    const { route, testLink } = setup('a', 'en', '/a/:b')
    testLink({ route: 'a', locale: 'en', params: { b: 'b' } }, route.getUrls({ b: 'b' }))
  })
 
})
