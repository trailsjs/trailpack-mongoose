# trailpack-mongoose
:package: Mongoose.js Trailpack [http://mongoosejs.com](http://mongoosejs.com)

[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]


Loads Application Models (in `api/models`) into the Mongoose ORM; Integrates with [trailpack-router](https://github.com/trailsjs/trailpack-router) to
generate Footprints for routes.

## Usage

### Configure

```js
// config/main.js
module.exports = {
  // ...
  packs: [
    require('trailpack-mongoose')
  ]
}
```

### Models

```js
module.exports = class User extends Model {

  static schema () {
    return {
      username: String,
      childs: [{
        type: Schema.ObjectId,
        ref: 'UserSchema'
      }]
      email: {
        type: String,
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: function () {
          validator: function (val) {
            return isEmail(val)
          },
          message: '{VALUE} is not a valid email'
        }
      }
    }
  }

  static config () {
    return {
      // Collection name
      tableName: 'users',

      // Schema options
      schema: {
        timestamps: true,

        versionKey: false,

        toObject: {
          virtuals: true
        },

        toJSON: {
          virtuals: true
        }
      },
      // Schema statics
      statics: {
        getByEmail: function (email) {
          return this
            .findOne({
              email: _.trim(email)
            })
            .exec()
        },
      },

      // Schema methods
      methods: {
        toJSON: function () {
          const user = this.toObject()
          delete user.password

          return user
        }
      }
    }
  }
  /**
   * After Trails.js will create model Schema you could add anything you want here
   * @param  {mongoose.Schema} schema mongoose new Schema object
   */
  static onSchema (schema) {
    // virtuals
    schema.virtual('name.full').get(function () {
      return this.name.first + ' ' + this.name.last
    })
    // lifecircle events
    schema.pre('save', function (next) {
      // performing actions
      next()
    })
  }
}
```

### Query

```js
// api/services/UserService.js
module.exports = {
  /**
   * Finds people with the given email.
   * @return Promise
   * @example {
   *    name: 'Ludwig Beethoven',
   *    email: 'someemail@email.com',
   *    favoriteColors: [
   *      { name: 'yellow', hex: 'ffff00' },
   *      { name: 'black', hex: '000000' }
   *     ]
   * }
   */
  findUser (email) {
    return this.orm.User.find({ email: email })
      .exec()
  }
}
```

## Contributing
We love contributions! Please check out our [Contributor's Guide](https://github.com/trailsjs/trails/blob/master/CONTRIBUTING.md) for more
information on how our projects are organized and how to get started.


## License
[MIT](https://github.com/trailsjs/trailpack-mongoose/blob/master/LICENSE)


[npm-image]: https://img.shields.io/npm/v/trailpack-mongoose.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-mongoose
[ci-image]: https://img.shields.io/travis/trailsjs/trailpack-mongoose/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/trailsjs/trailpack-mongoose
[daviddm-image]: http://img.shields.io/david/trailsjs/trailpack-mongoose.svg?style=flat-square
[daviddm-url]: https://david-dm.org/trailsjs/trailpack-mongoose
[codeclimate-image]: https://img.shields.io/codeclimate/github/trailsjs/trailpack-mongoose.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/trailsjs/trailpack-mongoose
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/trailsjs/trails
