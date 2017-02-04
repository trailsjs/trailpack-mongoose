'use strict'
const Model = require('trails/model')
const Schema = require('mongoose').Schema

module.exports = class Role extends Model {

  static schema (app, Mongoose) {

    return {
      name: String,
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }

  static config (app, Mongoose) {
    return {
      store: 'storeoverride',
      schema: {
        timestamps: true,
        versionKey: false
      }
    }
  }
}
