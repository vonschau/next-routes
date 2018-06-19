'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { isNull } from 'util';
import getRegionalLocale from '../helpers/getRegionalLocale';

const Aux = (props) => props.children
class Seo extends React.Component {

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

  render() {
    const { title = '', description = '', req = {} } = this.props
    return (
      <Aux>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />

        {this.getDescriptionTags(description)}
        {this.getOgLocale(req)}
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