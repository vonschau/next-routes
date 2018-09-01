export const generateRouteFromObjectName = (routeObject = {}, defaultLocale) => {
  let options
  options = routeObject

  if (!options.name) {
    throw new Error(`Unnamed routes not supported`)
  }

  if (!options.page) {
    options.page = options.name
  }

  const locale = options.locale || defaultLocale
  const update = options.update || false

  const { name, page, pattern, data } = options
  return { name, page, pattern, data, locale, update }
}

export const redirectToLocalizedHome = (res, locale) => {
  if (typeof res.redirect === 'function') {
    res.redirect(301, `/${locale}`)
  } else {
    res.writeHead(301, { 'Location': `/${locale}` })
    res.end()
  }
}