'use strict'

const assert = require('assert')

describe('Mongoose Trailpack', () => {
  let pack
  before(() => {
    pack = global.app.packs.mongoose
  })
  describe('#validate', () => {
    it.skip('TODO test')
  })

  describe('#configure', () => {
    it('should load collections', () => {
      assert(pack.mongoose)
    })
    it('should load and transform models', () => {
      assert(pack.models)
      assert(pack.models.User)
      assert(pack.models.Role)
    })
    it('should load and transform connections', () => {
      assert(pack.connections)
      assert(pack.connections.teststore)
    })
  })
})
