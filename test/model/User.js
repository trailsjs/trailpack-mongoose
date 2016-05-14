'use strict'
const Model = require('trails-model')

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
    })
  }
}
