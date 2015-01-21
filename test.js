var ifAsync = require('./index.js')
var should = require('should')

describe('async if', function() {
	it('use the first function as predicate', function (done) {
		ifAsync(function(callback) {
			done()
		})()
	})

	it('calls the second function if predicate calls back with a value that does not evaluate to false', function (done) {
		ifAsync(function (callback) {
			callback(null, 1)
		}, done)()
	})

	it('calls the third function if predicate calls back with a value that evaluates to false', function (done) {
		ifAsync(function (callback) {
			callback(null, 0)
		}, undefined, done)()
	})

	it('calls back with an error from the predicate', function (done) {
		ifAsync(function (callback) {
			callback(new Error())
		})(function (err) {
			err.should.be.an.Error
			done()
		})
	})

	it('hands the callback supplied by the caller to the action functions', function (done) {
		ifAsync(function (callback) {
			callback(null, true)
		}, function(callback) {
			callback.should.eql(done)
			callback()
		})(done)
	})

	it('exposes fluent interface', function (done) {
		ifAsync(function(callback) {
			callback(null, true)
		}).then(function(callback) {
			done()
		})()
	})
})