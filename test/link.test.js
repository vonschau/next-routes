/* global describe, test, expect */
import React from 'react'
import NextLink from 'next/link'
import ReactShallowRenderer from 'react-test-renderer/shallow'
import nextRoutes from '../src'

const renderer = new ReactShallowRenderer()
const setupRoute = (...args) => {
  const routes = nextRoutes({locale: 'en'}).add(...args)
  const route = routes.routes[routes.routes.length - 1]
  return {routes, route}
}

describe('Link', () => {
  const setup = (...args) => {
    const {routes, route} = setupRoute(...args)
    const {Link} = routes
    const props = {children: <a>hello</a>}
    const testLink = (addProps, expected) => {
      const actual = renderer.render(<Link {...props} {...addProps} />)
      expect(actual.type).toBe(NextLink)
      expect(actual.props).toEqual({...props, ...expected})
    }
    const testLinkException = (addProps) => {
      expect(() => renderer.render(<Link {...props} {...addProps} />)).toThrow()
    }
    return {routes, route, testLink, testLinkException}
  }

  test('with filtered params', () => {
    const {testLink} = setup('a', 'en', '/a/:b')
    testLink({href: '/', params: {b: 'b'}}, {href: '/'})
  })

  test('with name and params', () => {
    const {route, testLink} = setup('a', 'en', '/a/:b')
    testLink({href: 'a', locale: 'en', params: {b: 'b'}}, route.getUrls({b: 'b'}))
  })
/*
  test('with route not found', () => {
    setup('a', 'en').testLinkException({href: 'b'})
  })
*/
})
