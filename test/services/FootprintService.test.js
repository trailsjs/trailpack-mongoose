'use strict'

const assert = require('assert')
const _ = require('lodash')

describe('api.services.FootprintService', () => {
  let FootprintService
  before(() => {
    FootprintService = global.app.services.FootprintService
  })
  describe('#create', () => {
    it('should insert a record', () => {
      return FootprintService.create('Role', { name: 'createtest' })
        .then(role => {
          assert.equal(role.name, 'createtest')
        })
    })
  })
  describe('#find', () => {
    it('should find a single record', () => {
      return FootprintService.create('Role', { name: 'findtest' })
        .then(role => {
          assert.equal(role.name, 'findtest')
          assert(role.id)
          return FootprintService.find('Role', role.id)
        })
        .then(role => {
          assert(!role.length)
          assert.equal(role.name, 'findtest')
        })
    })
    it('should find a set of records', () => {
      return FootprintService.create('Role', { name: 'findtest' })
        .then(role => {
          assert.equal(role.name, 'findtest')
          assert(role.id)
          return FootprintService.find('Role', { name: 'findtest' })
        })
        .then(roles => {
          assert(roles[0])
          //assert.equal(roles.length, 1)
          assert.equal(roles[0].name, 'findtest')
        })
    })
  })
  describe('#update', () => {
    it('should update a set of records', () => {
      return FootprintService.create('Role', { name: 'updatetest' })
        .then(role => {
          assert.equal(role.name, 'updatetest')
          assert(role.id)
          return FootprintService.update(
            'Role',
            { name: 'updatetest' },
            { name: 'updated' }
          )
        })
        .then(roles => {
          assert(roles[0])
          assert.equal(roles[0].name, 'updated')
        })
    })

    it('should update a one record by id', () => {
      return FootprintService.create('Role', { name: 'updatetestid' })
        .then(role => {
          assert.equal(role.name, 'updatetestid')
          assert(role.id)
          return FootprintService.update(
            'Role',
            role.id,
            { name: 'updated' }
          )
        })
        .then(role => {
          assert(role)
          assert.equal(role.name, 'updated')
        })
    })
  })
  describe('#destroy', () => {
    it('should delete a set of records', () => {
      return FootprintService.create('Role', { name: 'destroytest' })
        .then(role => {
          assert.equal(role.name, 'destroytest')
          assert(role.id)
          return FootprintService.destroy('Role', { name: 'destroytest' })
        })
        .then(roles => {
          assert(roles[0])
          assert.equal(roles[0].name, 'destroytest')
          return FootprintService.find('Role', { name: 'destroytest' })
        })
        .then(roles => {
          assert.equal(roles.length, 0)
        })
    })

    it('should delete one record by id and return object', () => {
      return FootprintService.create('Role', { name: 'destroytestid' })
        .then(role => {
          assert.equal(role.name, 'destroytestid')
          assert(role.id)
          return FootprintService.destroy('Role', role.id)
        })
        .then(role => {
          assert(_.isObject(role))
          assert.equal(role.name, 'destroytestid')
          return FootprintService.find('Role', { name: 'destroytestid' })
        })
        .then(roles => {
          assert.equal(roles.length, 0)
        })
    })
  })

})
