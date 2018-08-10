'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import getRegionalLocale from '../helpers/getRegionalLocale';

class Seo extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      title: props.title,
      description: props.description,
      req: props.req,
      canonicalUrl: props.canonicalUrl
    }
  }

  getDescriptionTags(description) {
    if (!description) {
      return null
    }

    return (
      <React.Fragment>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="twitter:description" content={description} />
      </React.Fragment>
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

  getCanonical(canonicalUrl) {
    if (!canonicalUrl) {
      return null
    }

    return (
      <React.Fragment>
        <meta name="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
      </React.Fragment>
    )
  }

  getHrefLang({ getMultilanguageUrls, siteUrl }) {
    if (!siteUrl) {
      return null
    }

    const urls = getMultilanguageUrls()

    return urls.length > 1 && urls.map(({ url, locale }, key) => {
      const fullUrl = `${siteUrl.replace(/\/$/, "")}${url}`
      const regionalLocale = getRegionalLocale(locale)
      return <link rel="alternate" href={fullUrl} hrefLang={regionalLocale} key={key} />
    }) || null
  }

  render() {
    const { title: titleMeta = '', description = '', canonicalUrl = '', req = {} } = this.state
    return (
      <React.Fragment>
        <meta property="og:title" content={titleMeta} />
        <meta property="twitter:title" content={titleMeta} />

        {this.getDescriptionTags(description)}
        {this.getOgLocale(req)}
        {this.getCanonical(canonicalUrl)}
        {this.getHrefLang(req)}
      </React.Fragment>
    )
  }
}

Seo.propType = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  req: PropTypes.object
}

export default Seo
