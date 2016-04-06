'use strict'

const _ = require('lodash')
const Service = require('trails-service')

/**
 * Trails Service that maps abstract ORM methods to their respective Waterine
 * methods. This service can be thought of as an "adapter" between trails and
 * Mongoose. All methods return native ES6 Promises.
 */
module.exports = class FootprintService extends Service {

  /**
   * Create a model, or models. Multiple models will be created if "values" is
   * an array.
   *
   * @param modelName The name of the model to create
   * @param values The model's values
   * @return Promise
   */
  create (modelName, values, options) {
    const Model = this.app.orm[modelName] || this.app.packs.mongoose.orm[modelName]

    return new Promise((resolve, reject) => {
      Model.create(values).then(resolve).catch(reject)
    })
  }

  /**
   * Find all models that satisfy the given criteria. If a primary key is given,
   * the return value will be a single Object instead of an Array.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that filter the model resultset
   * @return Promise
   */
  find (modelName, criteria, options) {
    const Model = this.app.orm[modelName] || this.app.packs.mongoose.orm[modelName]
    const modelOptions = _.defaultsDeep({ }, options, _.get(this.config, 'footprints.models.options'))
    let query

    if (!options) {
      options = { }
    }
    if (!_.isPlainObject(criteria) || options.findOne === true) {
      query = Model.findOne({ _id: criteria })
    }
    else {
      query = Model.find(criteria)
      if (modelOptions.defaultLimit) {
        query = query.limit(modelOptions.defaultLimit)
      }
    }

    return new Promise((resolve, reject) => {
      query.exec().then(resolve).catch(reject)
    })
  }

  /**
   * Update an existing model, or models, matched by the given by criteria, with
   * the given values. If the criteria given is the primary key, then return
   * exactly the object that is updated; otherwise, return an array of objects.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated
   * @param [id] A optional model id; overrides "criteria" if both are specified.
   * @return Promise
   */
  update (modelName, criteria, values, options) {
    const Model = this.app.orm[modelName] || this.app.packs.mongoose.orm[modelName]
    const modelOptions = _.defaultsDeep({ }, options, _.get(this.config, 'footprints.models.options'))
    let query
    let ids;
    if (_.isPlainObject(criteria)) {
      query = Model.find(criteria).select('_id')
      if (modelOptions.defaultLimit) {
        query.limit(modelOptions.defaultLimit)
      }
      query = query.exec()
        .then((foundIds) => {
          ids = foundIds
          return Model.update({ _id: { $in: ids }}, values)
        })
        .then(() => Model.find({ _id: { $in: ids }}).exec())
    }
    else {
      query = Model
        .update({ _id: criteria }, values)
        .exec()
        .then(() => Model.findOne({ _id: criteria }).exec())
    }

    return new Promise((resolve, reject) => {
      query.then(resolve).catch(reject)
    })
  }

  /*
   * Destroy (delete) the model, or models, that match the given criteria.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated
   * @return Promise
   */
  destroy (modelName, criteria, options) {
    const Model = this.app.orm[modelName] || this.app.packs.mongoose.orm[modelName]
    let query
    let records
    if (_.isPlainObject(criteria)) {
      query = Model.find(criteria).exec()
        .then((list) => {
          records = list
          return Model.remove(criteria)
        })
        .then(() => records)
    }
    else {
      query = Model.findOne({ _id: criteria }).exec()
        .then(record => {
          records = record
          return Model.remove({ _id: criteria })
        })
        .then(() => records)
    }

    return new Promise((resolve, reject) => {
      query.then(resolve).catch(reject)
    })
  }

}
