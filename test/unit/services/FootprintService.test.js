/* global describe, it */
'use strict'

const expect = require('chai').expect

describe('FootprintService', () => {

  let FootprintService

  before(() => {
    FootprintService = global.app.services.FootprintService
  })

  it('should exist', () => {
    expect(global.app.api.services['FootprintService']).to.be.defined
    expect(global.app.services.FootprintService).to.be.an('object')
  })

  describe('#create', () => {

    it('fail if wrong Model', () => {
      return FootprintService
        .create('Something', {})
        .then(() => Promise.reject())
        .catch((err) => {
          expect(err).to.be.an('error')
            .and.to.have.property('message', 'No model found')
        })
    })

  })

  describe('#find', () => {

    it('fail if wrong model', () => {
      return FootprintService
        .find('Something')
        .then(() => Promise.reject())
        .catch((err) => {
          expect(err).to.be.an('error')
            .and.to.have.property('message', 'No model found')
        })
    })
  })

  describe('#update', () => {

    it('fail if wrong model', () => {
      return FootprintService
        .update('Something')
        .then(() => Promise.reject())
        .catch((err) => {
          expect(err).to.be.an('error')
            .and.to.have.property('message', 'No model found')
        })
    })
  })

  describe('#destroy', () => {

    it('fail if wrong model', () => {
      return FootprintService
        .destroy('Something')
        .then(() => Promise.reject())
        .catch((err) => {
          expect(err).to.be.an('error')
            .and.to.have.property('message', 'No model found')
        })
    })
  })

})
