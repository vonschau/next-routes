'use strict'

import getRegionalLocale from './../../src/helpers/getRegionalLocale'
describe('getRegionalLocale()', () => {
  test('can return empty string is props locale is empty', () => {
    expect(getRegionalLocale('')).toBe("")
  })

  test('can return empty string is props locale is invalid', () => {
    expect(getRegionalLocale('foo')).toBe("")
  })

  test('can return it_IT string if props locale is it', () => {
    expect(getRegionalLocale('it')).toBe("it_IT")
  })
})