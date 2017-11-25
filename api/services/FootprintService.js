'use strict'

const _ = require('lodash')
const Service = require('trails/lib/Service')

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
   * Get field definition for given model
   * @param {Mongoose.Model} model
   * @param {String} field
   * @returns {Object?} definition or null
   * @private
   */
  _getReferenceDefinition (model, field) {
    if (!_.isObject(model) || !_.has(model, 'schema.paths') || !_.isString(field))
      return null

    if (!model.schema.paths[field])
      return null

    return model.schema.paths[field]
  }

  /**
   * Try to load model by given parent model and reference field.
   * @param {Mongoose.Model} model
   * @param {String} reference
   * @returns {String} false if no reference exist or child Model name
   * @private
   */
  _getReferenceModelName (model, reference) {
    const ref = this._getReferenceDefinition(model, reference)
    if (!ref)
      return false

    if (_.has(ref, 'options.ref') && _.isString(ref.options.ref))
      return ref.options.ref

    if (_.has(ref, 'caster.options.ref') && _.isString(ref.caster.options.ref))
      return ref.caster.options.ref

    return false
  }

  /**
   * Create a model, or models. Multiple models will be created if "values" is
   * an array.
   *
   * @param {String} modelName The name of the model to create
   * @param {Object} values The model's values
   * @return {Promise}
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
   * @param {String} modelName The name of the model
   * @param {Array} [criteria] The criteria that filter the model resultset
   * @return {Promise}
   */
  find (modelName, criteria, options) {
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({ }, options,
      _.get(this.app.config, 'footprints.models.options'))

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
      if (modelOptions.limit) {
        query = query.limit(parseInt(modelOptions.limit))
      }
      else {
        if (modelOptions.defaultLimit) {
          query = query.limit(modelOptions.defaultLimit)
        }
      }

      if (modelOptions.offset) {
        query = query.skip(parseInt(modelOptions.offset))
      }

      if (modelOptions.sort) {
        query = query.sort(modelOptions.sort)
      }
    }

    if (_.isString(modelOptions.populate)) {
      // Need to find associated model
      const childModelName = this._getReferenceModelName(Model, modelOptions.populate)
      if (!childModelName) {
        return Promise.reject(new Error('No such reference exist: ' + modelOptions.populate))
      }
      const ChildModel = this._getModel(childModelName)
      if (!ChildModel) {
        return Promise.reject(new Error('No such model exist: ' + childModelName))
      }

      query = query.populate(modelOptions.populate, null, ChildModel)
    }

    return query.exec()
  }

  /**
   * Count all models that satisfy a given criteria.
   *
   * @param {String} modelName The name of the model
   * @param {Array} [criteria] The criteria that filter the model resultset
   * @return {Promise}
   */
  count (modelName, criteria) {
    const Model = this._getModel(modelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

    return Model
      .count(criteria)
      .exec()
  }

  /**
   * Update an existing model, or models, matched by the given by criteria, with
   * the given values. If the criteria given is the primary key, then return
   * exactly the object that is updated; otherwise, return an array of objects.
   *
   * @param {String} modelName The name of the model
   * @param {Array} [criteria] The criteria that determine which models are to be updated
   * @param {String|Mongoose.Schema.Types.ObjectId} [id] A optional model id; overrides "criteria" if both are specified.
   * @return {Promise}
   */
  update (modelName, criteria, values, options) {
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({ }, options,
      _.get(this.app.config, 'footprints.models.options'))

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
      if (!_.isString(modelOptions.populate)) modelOptions.populate = ''
      query = Model
        .update({ _id: criteria }, values)
        .exec()
        .then(() => Model.findOne({ _id: criteria }).populate(modelOptions.populate).exec())
    }

    return query
  }

  /**
   * Destroy (delete) the model, or models, that match the given criteria.
   *
   * @param {String} modelName The name of the model
   * @param {Array} [criteria] The criteria that determine which models are to be updated
   * @return {Promise}
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
   * @param {String} parentModelName The name of the model's parent
   * @param {String|ObjectId} parentId The id (required) of the parent model
   * @param {String} childAttributeName The name of the model to create
   * @param {Array|Object} values The model's values
   * @return {Promise}
   */
  createAssociation (parentModelName, parentId, childAttributeName, values, options) {
    const Model = this._getModel(parentModelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

    if (!parentId)
      return Promise.reject(new Error('No parentId provided'))

    const childModelName = this._getReferenceModelName(Model, childAttributeName)
    if (!childModelName)
      return Promise.reject(new Error('No such reference exist'))

    const childDefinition = this._getReferenceDefinition(Model, childAttributeName)
    options = options || {}
    return Model
      .findOne({ _id: parentId })
      .then((record) => {
        if (!record)
          return Promise.reject(new Error('No parent record found'))

        return this
          .create(childModelName, values, options)
          .then((child) => {
            if (!child || !child._id) // eslint-disable-line
              return Promise.reject(new Error('No _id for child record'))

            if (childDefinition.instance === 'Array')
              record[childAttributeName].push(child._id) // eslint-disable-line
            else
              record[childAttributeName] = child._id // eslint-disable-line


            return record
              .save()
              .then(() => child)
          })
      })
  }

  /**
   * Find all models that satisfy the given criteria, and which is associated
   * with the given Parent Model.
   *
   * @param {String} parentModelName The name of the model's parent
   * @param {String} childAttributeName The name of the model to create
   * @param {String|Mongoose.Schema.Types.ObjectId} parentId The id (required) of the parent model
   * @param {Array} [criteria] The search criteria
   * @return {Promise}
   */
  findAssociation (parentModelName, parentId, childAttributeName, criteria, options) {
    const Model = this._getModel(parentModelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

    if (!parentId)
      return Promise.reject(new Error('No parentId provided'))

    const childModelName = this._getReferenceModelName(Model, childAttributeName)
    if (!childModelName)
      return Promise.reject(new Error('No such reference exist'))

    if (!this.app.orm[childModelName])
      return Promise.reject(new Error('No such reference exist'))

    options = options || {}
    return this
      .find(parentModelName, parentId, options)
      .then((record) => {
        if (!record)
          return Promise.reject(new Error('No parent record found'))

        // Saving time. no need to make query if reference is empty
        if (!record[childAttributeName])
          return Promise.resolve([])

        let query
        if (_.isArray(record[childAttributeName]))
          query = { _id: { '$in': record[childAttributeName] } }
        else
          query = { _id: record[childAttributeName] }

        criteria = criteria || {}
        return this
          .find(childModelName, _.extend(query, criteria))
      })
  }

  /**
   * Update models by criteria, and which is associated with the given
   * Parent Model.
   *
   * @param {String} parentModelName The name of the model's parent
   * @param {String} parentId The id (required) of the parent model
   * @param {String} childAttributeName The name of the model to create
   * @param {Array} [criteria] The search criteria
   * @return {Promise}
   */
  updateAssociation (parentModelName, parentId, childAttributeName, criteria, values, options) {
    const Model = this._getModel(parentModelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

    if (!parentId)
      return Promise.reject(new Error('No parentId provided'))

    const childModelName = this._getReferenceModelName(Model, childAttributeName)
    if (!childModelName)
      return Promise.reject(new Error('No such reference exist'))

    options = options || {}
    return this
      .find(parentModelName, parentId, _.defaults({ findOne: true }, options))
      .then((record) => {
        if (!record)
          return Promise.reject(new Error('No parent record found'))

        if (!record[childAttributeName])
          return Promise.resolve(null)

        let ids
        if (_.isArray(record[childAttributeName]))
          ids = record[childAttributeName]
        else
          ids = [record[childAttributeName]]

        criteria = criteria || {}
        const query = _.extend({ _id: { '$in': ids } }, criteria)
        return this
          .update(childModelName, query, values)
      })
  }

  /**
   * Destroy models by criteria, and which is associated with the
   * given Parent Model.
   *
   * @param {String} parentModelName The name of the model's parent
   * @param {String} parentId The id (required) of the parent model
   * @param {String} childAttributeName The name of the model to create
   * @param {Array} [criteria] The search criteria
   * @return {Promise}
   */
  destroyAssociation (parentModelName, parentId, childAttributeName, criteria, options) {
    const Model = this._getModel(parentModelName)
    if (!Model)
      return Promise.reject(new Error('No model found'))

    if (!parentId)
      return Promise.reject(new Error('No parentId provided'))

    const childModelName = this._getReferenceModelName(Model, childAttributeName)
    if (!childModelName)
      return Promise.reject(new Error('No such reference exist'))

    options = options || {}
    return this
      .find(parentModelName, parentId, options)
      .then((record) => {
        if (!record)
          return Promise.reject(new Error('No parent record found'))

        if (_.isArray(record[childAttributeName])) {
          return this
            .find(childModelName, criteria, options)
            .then((list) => {
              if (!list)
                return []

              const ids = list.map(item => item._id) // eslint-disable-line
              return this
                .destroy(childModelName, { _id: { '$in': ids } })
                .then(() => {
                  record[childAttributeName] = _.difference(record[childAttributeName], ids)
                  return record.save()
                })
                .then(() => ids.map(id => { _id: id })) // eslint-disable-line
            })
        }
        else {
          return this
            .destroy(childModelName, record[childAttributeName], options)
            .then(() => {
              record[childAttributeName] = null
              return record.save()
            })
            .then(() => { _id: record[childAttributeName] }) // eslint-disable-line
        }
      })
  }

}
