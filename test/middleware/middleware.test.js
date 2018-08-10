import MiddlewareManager from "../../src/middleware/MiddlewareManager";

/* global jest, describe, test, expect */

describe('run sequence', () => {
  test('can run middleware on sequence passing the result of prev function', () => {

    const fn1 = jest.fn((data, cb) => {
      cb(null, true)
    })
    MiddlewareManager([fn1], {})((err, data) => {
      expect(fn1.mock.calls.length).toBe(1)
      expect(data).toBeTruthy()
      expect(err).toBe(null)
    })
  })

  test('can run middleware on exaclty sequence ', () => {

    const fn1 = jest.fn((data, cb) => {
      cb(null, 'foo')
    })
    const fn2 = jest.fn((data, cb) => {
      cb(null, data + '_bar')
    })

    MiddlewareManager([fn1, fn2], {})((err, data) => {
      expect(fn1.mock.calls.length).toBe(1)
      expect(fn2.mock.calls.length).toBe(1)
      expect(data).toBe('foo_bar')
    })
  })

  test('can block execution if at least a middleware thrown an error ', () => {

    const fn1 = jest.fn((data, cb) => {
      cb(new Error("this is an error"))
    })
    const fn2 = jest.fn((data, cb) => {
      cb(null, data + '_bar')
    })

    MiddlewareManager([fn1, fn2], {})((err, data) => {
      expect(fn1.mock.calls.length).toBe(1)
      expect(fn2.mock.calls.length).toBe(0)
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe("this is an error")
    })
  })
})