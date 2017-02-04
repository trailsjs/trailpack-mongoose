'use strict'
/* global describe, it */

const should = require('chai').should() //eslint-disable-line

describe('index.js', () => {

  let FootprintService

  before(() => {
    FootprintService = global.app.services.FootprintService
  })

  describe('onSchema binding', () => {
    it('should apply onSchema integration', () => {
      return FootprintService
        .create('User', {
          name: 'TEST_USERNAME',
          email: 'test@trailsjs.io',
          password: 'test'
        })
        .then((user)=>{
          user.password.should.be.equal('test***')
          user.name.should.be.equal('test_username')
        })
    })
  })
})
