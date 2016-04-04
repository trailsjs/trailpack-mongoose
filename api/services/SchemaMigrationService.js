'use strict'

const Service = require('trails-service')

/**
 * @module SchemaMigrationService
 * @description Schema Migrations
 */
module.exports = class SchemaMigrationService extends Service {

  /**
   * @param mongoose connection object
   *
   * Drop schema for a store
   */
  drop (mongoose, models) {
    return Promise.resolve()
  }

  /**
   * @param mongoose connection object
   *
   * Create schema for models in a store
   */
  create (mongoose, models) {
    return Promise.resolve()
  }

  /**
   * Alter an existing schema
   */
  alter (mongoose, model) {
    throw new Error('trailpack-mongoose does not currently support migrate=alter')
  }
}
