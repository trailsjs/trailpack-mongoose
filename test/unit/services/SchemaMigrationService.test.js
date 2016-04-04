/* global describe, it */

const _ = require('lodash')
const assert = require('assert')

describe('SchemaMigrationService', () => {
  it('should exist', () => {
    assert(global.app.api.services['SchemaMigrationService'])
  })
  describe('#create', () => {
    it('should create collections', () => {
      return Promise.all(_.map(global.app.models, model => {
        return Promise.resolve()
      }))
    })
  })
})
