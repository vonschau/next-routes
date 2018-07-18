'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import getRegionalLocale from '../helpers/getRegionalLocale';

const Aux = (props) => props.children
class Seo extends React.Component {

  constructor(props) {
    super(props)
  }

  getDescriptionTags(description) {
    if (!description) {
      return null
    }

    return (
      <Aux>
        <meta property="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="twitter:description" content={description} />
      </Aux>
    )
  }

  getOgLocale(req) {
    if (typeof req !== 'object' || Object.keys(req).length === 0) {
      return null
    }

    const { nextRoute } = req
    const regionalLocale = getRegionalLocale(nextRoute.locale)
    if (!regionalLocale) {
      return null
    }

    return <meta property="og:locale" content={regionalLocale} />
  }

  getCanonical({ originalUrl, siteName }) {
    if (!siteName) {
      return null
    }
    const url = siteName.endsWith('/') || originalUrl.startsWith('/') ? `${siteName}${originalUrl}` : `${siteName}/${originalUrl}`

    return (
      <Aux>
        <meta name="og:url" content={url} />
        <link rel="canonical" href={url} />
      </Aux>
    )
  }

  getHrefLang({ getMultilanguageUrls, siteName }) {
    if (!siteName) {
      return null
    }

    const urls = getMultilanguageUrls()

    return urls.length > 1 && urls.map(({ url, locale }, key) => {
      const fullUrl = `${siteName.replace(/\/$/, "")}${url}`
      const regionalLocale = getRegionalLocale(locale)
      return <link rel="alternate" href={fullUrl} hrefLang={regionalLocale} key={key} />
    }) || null
  }

  render() {
    const { title: titleMeta = '', description = '', req = {} } = this.props
    return (
      <Aux>
        <title>{titleMeta}</title>
        <meta property="og:title" content={titleMeta} />
        <meta property="twitter:title" content={titleMeta} />

        {this.getDescriptionTags(description)}
        {this.getOgLocale(req)}
        {this.getCanonical(req)}
        {this.getHrefLang(req)}
      </Aux>
    )
  }
}

Seo.propType = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  req: PropTypes.object
}

export default Seo