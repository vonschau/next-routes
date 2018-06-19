'use strict'

import { shallow } from 'enzyme'
import Seo from './../../src/seo'
import Route from './../../src/Route'


describe('Component: Seo', () => {
  describe('title tags', () => {
    test('can return component with only title field', () => {
      const result = shallow(<Seo title={'foo'} />)
      expect(result.contains(<title>foo</title>)).toBeTruthy()
    })
    test('can return component with only og:title field', () => {
      const result = shallow(<Seo title={'foo'} />)
      expect(result.contains(<meta property="og:title" content="foo" />)).toBeTruthy()
    })
    test('can return component with only tw:title field', () => {
      const result = shallow(<Seo title={'foo'} />)
      expect(result.contains(<meta property="twitter:title" content="foo" />)).toBeTruthy()
    })
  })

  describe('description tags', () => {
    test('can return component with only description field', () => {
      const result = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)
      expect(result.contains(<meta property="description" content="Lorem ipsum dolor sit amet" />)).toBeTruthy()
    })
    test('can return component with only og:description field', () => {
      const result = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)
      expect(result.contains(<meta property="og:description" content="Lorem ipsum dolor sit amet" />)).toBeTruthy()
    })
    test('can return component with only tw:description field', () => {
      const result = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)
      expect(result.contains(<meta property="twitter:description" content="Lorem ipsum dolor sit amet" />)).toBeTruthy()
    })
  })

  test('can return null on getOgLocale function', () => {
    const seoComponent = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)

    const result = seoComponent.instance().getOgLocale({})

    expect(result).toBeNull()

  })
  test('can return component with only locale field', () => {
    const routeData = { name: 'home', locale: 'it', page: 'home', pattern: '/', forceLocale: true }
    const activeRoute = new Route(routeData)
    const result = shallow(<Seo req={{ nextRoute:  activeRoute  }} />)
    expect(result.contains(<meta property="og:locale" content="it_IT" />)).toBeTruthy()
  })
  test('can return component with only canonical field', () => { })
  test('can return component without canonical field because site_name is not setted', () => { })
  test('can return component with only alt canonical field', () => { })
})