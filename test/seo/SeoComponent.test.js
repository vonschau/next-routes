'use strict'

import { shallow } from 'enzyme'
import Seo from './../../src/seo'
describe('Component: Seo', () => {
  describe('title tags', () => {
    test('can return component with only title field', () => {
      const result = shallow(<Seo title={'foo'} />)
      expect(result.contains(<title>foo</title>)).toBeTruthy()
    })
    test('can return component with only og:title field', () => {
      const result = shallow(<Seo title={'foo'} />)
      expect(result.contains(<meta name="og:title" content="foo" />)).toBeTruthy()
    })
    test('can return component with only tw:title field', () => {
      const result = shallow(<Seo title={'foo'} />)
      expect(result.contains(<meta name="twitter:title" content="foo" />)).toBeTruthy()
    })
  })

  describe('description tags', () => {
    test('can return component with only description field', () => {
      const result = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)
      expect(result.contains(<meta name="description" content="Lorem ipsum dolor sit amet" />)).toBeTruthy()
    })
    test('can return component with only og:description field', () => {
      const result = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)
      expect(result.contains(<meta name="og:description" content="Lorem ipsum dolor sit amet" />)).toBeTruthy()
    })
    test('can return component with only tw:description field', () => {
      const result = shallow(<Seo description={'Lorem ipsum dolor sit amet'} />)
      expect(result.contains(<meta name="twitter:description" content="Lorem ipsum dolor sit amet" />)).toBeTruthy()
    })
  })

  test('can return component with only locale field', () => { })
  test('can return component with only canonical field', () => { })
  test('can return component without canonical field because site_name is not setted', () => { })
  test('can return component with only alt canonical field', () => { })
  test('can return component with only image field', () => { })
  test('can return component with only tw:image field', () => { })
})