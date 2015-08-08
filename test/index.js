import { expect } from 'chai'
import bluebird from 'bluebird'

import makeConcurrent from '../src'

function runTests (Promise) {
  var createConcurrentFn = makeConcurrent(Promise)

  function pdelay (delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay)
    })
  }

  it('concurrency is 0', (done) => {
    var total = 0
    var fn = createConcurrentFn((x) => {
      total += x
      return pdelay(100)
    }, {concurrency: 0})

    expect(total).to.equal(0)
    setTimeout(() => { expect(total).to.equal(14) }, 50)
    setTimeout(done, 150)

    fn(2)
    fn(4)
    fn(8)
  })

  it('concurrency is 1', (done) => {
    var total = 0
    var fn = createConcurrentFn((x) => {
      total += x
      return pdelay(100)
    })

    expect(total).to.equal(0)
    setTimeout(() => { expect(total).to.equal(2) }, 50)
    setTimeout(() => { expect(total).to.equal(6) }, 150)
    setTimeout(() => { expect(total).to.equal(14) }, 250)
    setTimeout(done, 350)

    fn(2)
    fn(4)
    fn(8)
  })

  it('concurrency is 2', (done) => {
    var total = 0
    var fn = createConcurrentFn((x) => {
      total += x
      return pdelay(100)
    }, {concurrency: 2})

    expect(total).to.equal(0)
    setTimeout(() => { expect(total).to.equal(6) }, 50)
    setTimeout(() => { expect(total).to.equal(14) }, 150)
    setTimeout(done, 250)

    fn(2)
    fn(4)
    fn(8)
  })

  it('returned value', (done) => {
    var fn = createConcurrentFn((x) => {
      return x * 2
    })

    bluebird.try(() => {
      return fn(2)
    })
    .asCallback((err, val) => {
      expect(err).to.be.null
      expect(val).to.equal(4)
      done()
    })
  })

  it('throw error', (done) => {
    var fn = createConcurrentFn((x) => {
      throw new Error(x)
    })

    bluebird.try(() => {
      return fn('msg!')
    })
    .asCallback((err, val) => {
      expect(err).to.be.instanceof(Error)
      expect(err.message).to.equal('msg!')
      expect(val).to.be.undefined
      done()
    })
  })
}

var promises = {
  'Promise': Promise,
  'bluebird': require('bluebird'),
  // 'Q': require('q'),
  'lie': require('lie')
}

Object.keys(promises).forEach((key) => {
  describe(key, () => { runTests(promises[key]) })
})
