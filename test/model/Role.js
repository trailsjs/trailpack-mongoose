'use strict'
const Model = require('trails-model')
const Schema = require('mongoose').Schema

module.exports = class Role extends Model {

  static schema () {

    return {
      user: {
        type: Schema.ObjectId,
        ref: 'UserSchema'
      }
    };
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
