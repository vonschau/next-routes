'use strict'

import React from 'react'
import PropTypes from 'prop-types'

const Aux = (props) => props.children
class Seo extends React.Component {

  getDescriptionTags(description) {
    if (!description) {
      return null
    }

    return (
      <Aux>
        <meta name="description" content={description} />
        <meta name="og:description" content={description} />
        <meta name="twitter:description" content={description} />
      </Aux>
    )
  }

  render() {
    const { title = '', description = '' } = this.props
    return (
      <Aux>
        <title>{title}</title>
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />

        {this.getDescriptionTags(description)}
      </Aux>
    )
  }
}

Seo.propType = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string
}

export default Seo