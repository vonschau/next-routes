'use strict'

import async from 'async'

export default (middlewares = [], initialData = {}) => {
  return async.compose(
    ...middlewares.reverse(),
    function (cb) {
      cb(null, initialData)
    },
  )
}