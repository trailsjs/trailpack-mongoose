'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')
const User = require('./model/User')
const Role = require('./model/Role')

module.exports = _.defaultsDeep({
  pkg: {
    name: 'mongoose-trailpack-test'
  },
  api: {
    models: {
      User: User,
      Role: Role
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
        },
        storeoverride: {
          uri: 'mongodb://localhost:27017/test2',
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
