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
   * Internal method to retreive model object
   * @param {String} modelName name of the model to retreive
   * @returns {Object?}
   * @private
   */
  _getModel (modelName) {
    return this.app.orm[modelName] || this.app.packs.mongoose.orm[modelName]
  }

  /**
   * Create a model, or models. Multiple models will be created if "values" is
   * an array.
   *
   * @param {String} modelName The name of the model to create
   * @param {Object} values The model's values
   * @return Promise
   */
  create (modelName, values, options) {
    const Model = this._getModel(modelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

    return Model.create(values)
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
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({ }, options,
      _.get(this.config, 'footprints.models.options'))

    if (!Model)
      return Promise.reject(new Error('No model found'))

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

    return query.exec()
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
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({ }, options,
      _.get(this.config, 'footprints.models.options'))

    if (!Model)
      return Promise.reject(new Error('No model found'))

    let query
    let ids
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

    return query
  }

  /*
   * Destroy (delete) the model, or models, that match the given criteria.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated
   * @return Promise
   */
  destroy (modelName, criteria, options) {
    const Model = this._getModel(modelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

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

    return query
  }

  /**
   * Create a model, and associate it with its parent model.
   *
   * @param parentModelName The name of the model's parent
   * @param childAttributeName The name of the model to create
   * @param parentId The id (required) of the parent model
   * @param values The model's values
   * @return Promise
   */
  createAssociation (parentModelName, parentId, childAttributeName, values, options) {
    return Promise.reject('trailpack-mongoose does not have createAssociation support yet. Sorry')
  }

  /**
   * Find all models that satisfy the given criteria, and which is associated
   * with the given Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param childAttributeName The name of the model to create
   * @param parentId The id (required) of the parent model
   * @param criteria The search criteria
   * @return Promise
   */
  findAssociation (parentModelName, parentId, childAttributeName, criteria, options) {
    return Promise.reject('trailpack-mongoose does not have findAssociation support yet. Sorry')
  }

  /**
   * Update models by criteria, and which is associated with the given
   * Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param parentId The id (required) of the parent model
   * @param childAttributeName The name of the model to create
   * @param criteria The search criteria
   * @return Promise
   */
  updateAssociation (parentModelName, parentId, childAttributeName, criteria, values, options) {
    return Promise.reject('trailpack-mongoose does not have updateAssociation support yet. Sorry')
  }

  /**
   * Destroy models by criteria, and which is associated with the
   * given Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param parentId The id (required) of the parent model
   * @param childAttributeName The name of the model to create
   * @param criteria The search criteria
   * @return Promise
   */
  destroyAssociation (parentModelName, parentId, childAttributeName, criteria, options) {
    return Promise.reject('trailpack-mongoose does not have destroyAssociation support yet. Sorry')
  }

}
