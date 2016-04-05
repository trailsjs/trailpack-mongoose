'use strict'

const assert = require('assert')

describe('Mongoose Trailpack', () => {
  let pack
  before(() => {
    pack = global.app.packs.mongoose
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
      assert(pack.connections.storeoverride)
    })
  })

  describe('#initialize', () => {

    it('should expose the "orm" property on the trailpack and application', () => {
      assert(pack.orm)
      assert(pack.orm.User)
      assert(pack.orm.Role)
    })

    it('should expose the globalId-indexed "orm" property on "app"', () => {
      assert(pack.app.orm)
      assert(pack.app.orm.User)
      assert(pack.app.orm.Role)
      assert(pack.app.orm.Role.create)
      assert(pack.app.orm.Role.find)
    })

    it('should be able to query things', () => {
      const Role = pack.orm.Role
      return Role.find({ name: 'xyz' }).then(results => {
        assert(results)
        assert.equal(results.length, 0)
      })
    })
    it('should be able to insert things', () => {
      const Role = pack.orm.Role
      return Role.create({ name: 'foo' })
        .then(role => {
          assert(role)
          assert.equal(role.name, 'foo')

          return Role.find({ name: 'foo' })
        })
        .then(roles => {
          assert.equal(roles.length, 1)
        })
    })
  })
})
