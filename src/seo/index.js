import Seo from './seoComponent'

export default function (Child) {
  const childInitialProps = Child.getInitialProps
  Child.getInitialProps = (ctx) => {
    const { req = {} } = ctx
    const { nextRoute, getMultilanguageUrls, siteName, originalUrl } = req
    Seo.defaultProps = Object.assign({}, Seo.defaultProps, { req: { nextRoute, getMultilanguageUrls, siteName, originalUrl } })
    const childProps = childInitialProps({ req })

    return { ...childProps, SeoComponent: Seo }
  }

  return Child
}