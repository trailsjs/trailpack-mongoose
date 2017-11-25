'use strict'

const _ = require('lodash')
const Service = require('trails/lib/Service')

/**
 * @module SchemaMigrationService
 * @description Schema Migrations
 */
module.exports = class SchemaMigrationService extends Service {

  /**
   * @param connection connection object
   *
   * Drop collections in current connection
   */
  drop (connection) {
    return Promise.all(
      _.map(connection.collections, collection => {
        return new Promise((resolve, reject) => {
          collection.drop((err) => {
            resolve()
          })
        })
      }))
  }

  /**
   * Alter an existing schema
   */
  alter (connection) {
    throw new Error('trailpack-mongoose does not currently support migrate=alter')
  }
}
