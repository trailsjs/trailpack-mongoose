'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const DatastoreTrailpack = require('trailpack-datastore')
const lib = require('./lib')

/**
 * Mongoose integration for Trails. Allows mongoose to read its configration from the
 * trails datastore config, and auto-migrate on startup.
 */
module.exports = class MongooseTrailpack extends DatastoreTrailpack {

  /**
   * Ensure that this trailpack supports the configured migration
   */
  validate () {
    if (!_.includes([ 'none', 'drop', 'create' ], this.app.config.database.models.migrate)) {
      throw new Error('Migrate must be configured to either "create" or "drop"')
    }
  }

  configure () {
    this.app.config.database.orm = 'mongoose'

    this.mongoose = mongoose
  }

  /**
   * Initialize mongoose connections, and perform migrations.
   */
  initialize () {
    super.initialize()

    this.models = lib.Transformer.transformModels(this.app)

    this.orm = this.orm || {}
    this.connections = _.mapValues(this.app.config.database.stores, (_store, storeName) => {
      const store = _.merge({ }, _store)
      if (!_.isString(store.uri))
        throw new Error('Store have to contain "uri" option')

      if (!_.isObject(store.options))
        store.options = {}

      // Setup promise library for mongoose
      if (!store.options.promiseLibrary)
        store.options.promiseLibrary = global.Promise

      const connection = mongoose.createConnection(store.uri, store.options)
      const models = _.pickBy(this.models, { connection: storeName })

      _.map(models, model => {
        const schema = new mongoose.Schema(model.schema, model.schemaOptions)
        // Bind statics & methods
        schema.statics = model.statics
        schema.methods = model.methods

        model.onSchema(schema)

        //create model
        this.orm[model.globalId] = connection.model(model.globalId, schema, model.tableName)
        this.packs.mongoose.orm[model.identity] = this.orm[model.globalId]
      })

      return connection
    })

    this.app.orm = this.orm

    return this.migrate()
  }

  /**
   * Close all database connections
   */
  unload () {
    return Promise.all(
      _.map(this.connections, connection => {
        return new Promise((resolve, reject) => {
          connection.close((err) => {
            if (err)
              return reject(err)

            resolve()
          })
        })
      })
    )
  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }

  migrate () {
    const SchemaMigrationService = this.app.services.SchemaMigrationService
    const database = this.app.config.database

    if (database.models.migrate == 'none') return

    return Promise.all(
      _.map(this.connections, connection => {
        if (database.models.migrate == 'drop') {
          return SchemaMigrationService.drop(connection)
        }
      }))
  }
}
