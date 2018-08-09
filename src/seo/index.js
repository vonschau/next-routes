import Seo from './seoComponent'
import { Component } from 'react'

export default Child => class extends Component {
  static async getInitialProps(ctx) {
    const childInitialProps = Child.getInitialProps
    const { req = {} } = ctx
    const { nextRoute, getMultilanguageUrls, siteUrl, originalUrl } = req
    Seo.defaultProps = Object.assign({}, Seo.defaultProps, { req: { nextRoute, getMultilanguageUrls, siteUrl, originalUrl } })
    const childProps = await childInitialProps(ctx)

    return { ...childProps, SeoComponent: Seo || React.Component }
  }

  render() {
    const { SeoComponent = React.Component } = this.props
    return (
      <Child {...this.props} SeoComponent={SeoComponent} />
    );
  }
};