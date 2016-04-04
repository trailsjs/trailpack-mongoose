'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')
const Model = require('trails-model')

module.exports = _.defaultsDeep({
  pkg: {
    name: 'mongoose-trailpack-test'
  },
  api: {
    models: {
      User: class User extends Model {
        static schema (schema) {
          return {
            title: String,
            num: Number,
            active: Boolean
          }
        }
      }
    }
  },
  config: {
    log: {
      logger: new smokesignals.Logger('error')
    },
    main: {
      packs: [
        require('trailpack-core'),
        require('../') // trailpack-mongoose
      ]
    },
    database: {
      stores: {
        teststore: {
          uri: 'mongodb://localhost:27017/test',
          options: {

          }
        }
      },
      models: {
        defaultStore: 'teststore',
        migrate: 'drop'
      }
    }
  }
}, smokesignals.FailsafeConfig)
