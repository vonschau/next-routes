
import React from 'react'
import withSeo from './../../src/seo'
import mocks from 'node-mocks-http'
import { shallow } from 'enzyme'
import { Routes as nextRoutes } from './../../src'
import Seo from './../../src/seo/seoComponent'

class FakeComponent extends React.Component {
  static getInitialProps() {
    return { foo: 'bar' }
  }
  render() {
    const { SeoComponent } = this.props
    return (<SeoComponent title="foo" description="bar"/>)
  }
}
describe('High Order Component', () => {
  let req = {}
  let routes
  beforeAll(() => {
    routes = nextRoutes({ locale: 'it', siteName: 'https://test.com' })
      .add('home', 'en', '/', 'homepage')
      .add('home', 'it', '/', 'homepage')
      .add('home', 'de', '/', 'homepage')
      .add('home', 'fr', '/', 'homepage')

    req = mocks.createRequest({
      method: 'GET',
      url: '/en'
    })
  })

  test('can return child component with SeoComponent in props', () => {
    routes.getRequestHandler({ getRequestHandler: jest.fn(), render: jest.fn() })(req)
    const componentWrapped = withSeo(FakeComponent)
    const result = componentWrapped.getInitialProps({req})
    expect(result).toHaveProperty('SeoComponent')
  })

  test('can return same react component', () => {
    const componentWrapped = withSeo(FakeComponent)
    expect(React.Component.isPrototypeOf(componentWrapped)).toBeTruthy()
  })

  test('can return render component with SeoComponent', () => {
    routes.getRequestHandler({ getRequestHandler: jest.fn(), render: jest.fn() })(req)
    const ComponentWrapped = withSeo(FakeComponent)
    const props = ComponentWrapped.getInitialProps({req})

    const result = shallow(<FakeComponent {...props} />)
    expect(result.html()).toContain('<meta property="og:title" content="foo"/>')
  })
})