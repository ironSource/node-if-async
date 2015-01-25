var ifAsync = require('./index.js')
var should = require('should')

describe('ifAsync', function() {
	it('requires at least one predicate', function () {
		(function () {
			ifAsync()
		}).should.throw('at least one predicate and one consequent are required')
	})

	it('throws an error if at least one consequent is not provided', function () {
		(function () {
			ifAsync(function (callback) { callback(null, true) })(function () {

			})
		}).should.throw('missing at least one consequent, you forgot to call then() ?')
	})

	it('invokes the predicate', function (done) {
		var predicateInvoked = false

		var functor = ifAsync(
			function predicate(callback) {
				predicateInvoked = true
				callback(null, 1)
			}, 
			function consequent(callback) {
				callback()
			}
		)

		functor(function callback(err) {
			predicateInvoked.should.be.true
			done()
		})
	})

	it('invokes the consequent if the predicate evaluates to "true"', function (done) {
		var consequentInvoked = false
		
		var functor = ifAsync(
			function predicate(callback) {
				callback(null, 1)
			}, 
			function consequent(callback) {
				consequentInvoked = true
				callback()
			}
		)

		functor(function callback(err) {
			consequentInvoked.should.be.true
			done()
		})
	})

	it('invokes the default consequent if predicate evaluates to "false"', function (done) {
		var consequentInvoked = false
		var defaultConsequentInvoked = false

		var functor = ifAsync(
			function predicate(callback) {
				callback(null, 0)
			}, 
			function consequent(callback) {
				consequentInvoked = true
				callback()
			},
			function defaultConsequent(callback) {
				defaultConsequentInvoked = true
				callback()
			}
		)

		functor(function callback(err) {
			consequentInvoked.should.be.false
			defaultConsequentInvoked.should.be.true
			done()
		})
	})

	it('invokes a second predicate if it is provided when the first predicate does not evaluate to true', function (done) {
		var p1Invoked = false
		var p2Invoked = false
		var c1Invoked = false
		var c2Invoked = false
		
		var functor = ifAsync(
			function predicate1(callback) {
				p1Invoked = true
				callback(null, 0)
			}, 
			function consequent1(callback) {
				c1Invoked = true
				callback()
			}, 
			function predicate2(callback) {
				p2Invoked = true
				callback(null, 1)
			}, 
			function consequent2(callback) {
				c2Invoked = true
				callback()
			}
		)

		functor(function (err) {
			p1Invoked.should.be.true
			c1Invoked.should.be.false
			p2Invoked.should.be.true
			c2Invoked.should.be.true
			done()
		})
	})

	it('has fluent interface', function (done) {
		var p1Invoked = false
		var p2Invoked = false
		var c1Invoked = false
		var c2Invoked = false
		
		var functor = ifAsync(function predicate1(callback) {
			p1Invoked = true
			callback(null, 0)
		})
		.then(function consequent1(callback) {
			c1Invoked = true
			callback()
		})
		.elseIf(function predicate2(callback) {
			p2Invoked = true
			callback(null, 1)
		})
		.then(function consequent2(callback) {
			c2Invoked = true
			callback()
		})		

		functor(function (err) {
			p1Invoked.should.be.true
			c1Invoked.should.be.false
			p2Invoked.should.be.true
			c2Invoked.should.be.true
			done()
		})
	})

	it('cannot call elseIf() after elseIf()', function () {
		(function () {			
			ifAsync(pFalse).then(foo).elseIf(pFalse).elseIf(pFalse)	
		}).should.throw('only then() may be called after elseIf()')
	})

	describe('has an and() operator', function () {
		it('ifAsync(true).and(false) should invoke both predicates and the else consequent', function (done) {
			var p1Invoked = false
			var p2Invoked = false
			var c1Invoked = false
			var c2Invoked = false

			ifAsync(function(callback) {
				p1Invoked = true
				callback(null, true)
			})
			.and(function (callback) {
				p2Invoked = true
				callback(null, false)
			}).then(function(cb) {
				c1Invoked = true
				cb()
			}).else(function (cb) {
				c2Invoked = true
				cb()
			})(function (err) {
				p1Invoked.should.be.true
				p2Invoked.should.be.true
				c1Invoked.should.be.false
				c2Invoked.should.be.true
				done()
			})	
		})
		
		it('ifAsync(false).and(*) should invoke the first predicate and the second (else) consequent, it should not invoke the second predicate', function(done) {
			var p1Invoked = false
			var p2Invoked = false
			var c1Invoked = false
			var c2Invoked = false

			ifAsync(function(callback) {
				p1Invoked = true
				callback(null, false)
			})
			.and(function (callback) {
				p2Invoked = true
				callback(null, true)
			}).then(function(cb) {
				c1Invoked = true
				cb()
			}).else(function (cb) {
				c2Invoked = true
				cb()
			})(function (err) {
				p1Invoked.should.be.true
				p2Invoked.should.be.false
				c1Invoked.should.be.false
				c2Invoked.should.be.true
				done()
			})
		})

		it('ifAsync(true).and(true) should invoke both predicates and the first (then) consequent', function(done) {
			var p1Invoked = false
			var p2Invoked = false
			var c1Invoked = false
			var c2Invoked = false

			ifAsync(function(callback) {
				p1Invoked = true
				callback(null, true)
			})
			.and(function (callback) {
				p2Invoked = true
				callback(null, true)
			}).then(function(cb) {
				c1Invoked = true
				cb()
			}).else(function (cb) {
				c2Invoked = true
				cb()
			})(function (err) {
				p1Invoked.should.be.true
				p2Invoked.should.be.true
				c1Invoked.should.be.true
				c2Invoked.should.be.false
				done()
			})
		})
	})

	describe('has an or() operator', function () {
		it('ifAsync(true).or(*) should invoke the first predicate and the first (then) consequent, it should not invoke the second predicate', function (done) {
			var p1Invoked = false
			var p2Invoked = false
			var c1Invoked = false
			var c2Invoked = false

			ifAsync(function(callback) {
				p1Invoked = true
				callback(null, true)
			})
			.or(function (callback) {
				p2Invoked = true
				callback(null, true)
			}).then(function(cb) {
				c1Invoked = true
				cb()
			}).else(function (cb) {
				c2Invoked = true
				cb()
			})(function (err) {
				p1Invoked.should.be.true
				p2Invoked.should.be.false
				c1Invoked.should.be.true
				c2Invoked.should.be.false
				done()
			})
		})

		it('ifAsync(false).or(true) should invoke both predicates and the first (then) consequent', function (done) {
			var p1Invoked = false
			var p2Invoked = false
			var c1Invoked = false
			var c2Invoked = false

			ifAsync(function(callback) {
				p1Invoked = true
				callback(null, false)
			})
			.or(function (callback) {
				p2Invoked = true
				callback(null, true)
			}).then(function(cb) {
				c1Invoked = true
				cb()
			}).else(function (cb) {
				c2Invoked = true
				cb()
			})(function (err) {
				p1Invoked.should.be.true
				p2Invoked.should.be.true
				c1Invoked.should.be.true
				c2Invoked.should.be.false
				done()
			})
		})

		it('ifAsync(false).or(false) should invoke both predicates and the second (else) consequent', function (done) {
			var p1Invoked = false
			var p2Invoked = false
			var c1Invoked = false
			var c2Invoked = false

			ifAsync(function(callback) {
				p1Invoked = true
				callback(null, false)
			})
			.or(function (callback) {
				p2Invoked = true
				callback(null, false)
			}).then(function(cb) {
				c1Invoked = true
				cb()
			}).else(function (cb) {
				c2Invoked = true
				cb()
			})(function (err) {
				p1Invoked.should.be.true
				p2Invoked.should.be.true
				c1Invoked.should.be.false
				c2Invoked.should.be.true
				done()
			})
		})
	})

	function pTrue (callback) {
		callback(null, true)
	}

	function pFalse (callback) {
		callback(null, false)
	}

	function foo (callback) {
		callback()
	}
})