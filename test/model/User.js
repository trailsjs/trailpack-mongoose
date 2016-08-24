'use strict'
const Model = require('trails-model')
const Schema = require('mongoose').Schema

module.exports = class User extends Model {

  static schema () {

    return {
      name: String,
      password: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      active: {
        type: Boolean,
        default: false
      },
      role: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
      },

      roles: {
        type: [Schema.Types.ObjectId],
        ref: 'Role'
      }
    }
  }

  static config () {
    return {
      schema: {
        timestamps: true,
        versionKey: false
      },
      statics: {
        getByEmail: function (email) {
          return this
            .findOne({ email: email })
            .exec()
        }
      },
      methods: {
        makeActive () {
          this.active = true
        }
      }
    }
  }

  static onSchema (schema) {
    schema.virtual('test').get(function () {
      return '|' + this.name + '|'
    })

    schema.pre('save', function (next) {
      if (!this.isModified('password')) {
        return next()
      }
      this.password += '***' //stupid check
      return next()
    })
  }
}
