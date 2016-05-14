'use strict'

const _ = require('lodash')

module.exports = {

  transformModels (app) {
    const models = app.models
    const dbConfig = app.config.database
    return _.mapValues(models, (model, modelName) => {
      const config = model.constructor.config() || { }
      const schema = model.constructor.schema() || { }
      const onSchema = model.constructor.onSchema || _.noop

      return {
        identity: modelName.toLowerCase(),
        globalId: modelName,
        tableName: config.tableName || modelName.toLowerCase(),
        connection: config.store || dbConfig.models.defaultStore,
        migrate: config.migrate || dbConfig.models.migrate,
        schema: schema,
        schemaOptions: config.schema,
        statics: config.statics || {},
        methods: config.methods || {},
        onSchema: onSchema
      }

    })
  }

}
