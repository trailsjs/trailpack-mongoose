'use strict'

const assert = require('assert')

describe('Mongoose Trailpack', () => {
  describe('#initialize', () => {
    it('should group stores and models', () => {
      const stores = global.app.packs.mongoose.stores
      assert(stores.teststore)
      assert(stores.teststore.models)
      assert.equal(stores.teststore.models.user)
      assert.equal(stores.teststore.models.user)
    })
  })
})
