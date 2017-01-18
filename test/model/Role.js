'use strict'
const Model = require('trails/model')
const Schema = require('mongoose').Schema

module.exports = class Role extends Model {

  static schema () {

    return {
      name: String,
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }

  static config () {
    return {
      store: 'storeoverride',
      schema: {
        timestamps: true,
        versionKey: false
      }
    }
  }
}
