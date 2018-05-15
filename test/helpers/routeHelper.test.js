import { generateRouteFromObjectName } from './../../src/helpers/routeHelper'

describe('generateRouteFromObject()', () => {
  it('thrown err if name not exist', () => {
    const objectRoute = { foo: 'bar' }

    const error = () => {
      generateRouteFromObjectName(objectRoute)
    };

    expect(error).toThrowError(Error)
  })

  it('return object with defined structure', () => {
    const objectRoute = { name: 'bar', page: 'page', locale: 'en', update: true, foo: 'bar' }

    const result = generateRouteFromObjectName(objectRoute);

    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('page')
    expect(result).toHaveProperty('locale')
    expect(result).toHaveProperty('update')
    expect(result).not.toHaveProperty('foo')
  })
})