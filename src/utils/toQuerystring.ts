export default (obj: any) =>
  Object.keys(obj)
    .map(key => {
      let value = obj[key]
      if (Array.isArray(value)) {
        value = value.join('/')
      }
      return [encodeURIComponent(key), encodeURIComponent(value)].join('=')
    })
    .join('&')
