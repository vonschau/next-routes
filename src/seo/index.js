import Seo from './seoComponent'

export default function (Child) {
  const childInitialProps = Child.getInitialProps
  Child.getInitialProps = async (ctx) => {
    const { req = {} } = ctx
    const { nextRoute, getMultilanguageUrls, siteUrl, originalUrl } = req
    Seo.defaultProps = Object.assign({}, Seo.defaultProps, { req: { nextRoute, getMultilanguageUrls, siteUrl, originalUrl } })
    const childProps = await childInitialProps(ctx)

    return { ...childProps, SeoComponent: Seo }
  }

  return Child
}