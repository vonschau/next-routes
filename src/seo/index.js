import Seo from './seoComponent'

export default function (Child) {
  const childInitialProps = Child.getInitialProps
  Child.getInitialProps = async (ctx) => {
    const { req = {} } = ctx
    const { nextRoute, getMultilanguageUrls, siteName, originalUrl } = req
    Seo.defaultProps = Object.assign({}, Seo.defaultProps, { req: { nextRoute, getMultilanguageUrls, siteName, originalUrl } })
    const childProps = await childInitialProps(ctx)

    return { ...childProps, SeoComponent: Seo }
  }

  return Child
}