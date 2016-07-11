/**
 * Database Configuration
 * (app.config.database)
 *
 * Configure the ORM layer, connections, etc.
 *
 * @see {@link http://trailsjs.io/doc/config/database}
 */
module.exports = {

  /**
   * Define the database stores. A store is typically a single database.
   *
   * Set production connection info in config/env/production.js
   */
  stores: {

    mongodbstore: {
      // should be 'create' or 'drop'
      migrate: 'create',

      uri: 'mongodb://localhost:27017/test',

      options: {}
    }
  },

  models: {
    defaultStore: 'mongodbstore',
    migrate: 'drop'
  }
}
