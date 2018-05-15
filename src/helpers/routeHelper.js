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

