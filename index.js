var util = require('util')

module.exports = ifAsync

var OK = 0
var EXPECT_THEN = 1

function ifAsync() {

	var clauses = toArray(arguments)
	var elseClause = elseNoop
	var fluentState = OK

	if (clauses.length  === 0) {
		throw new Error('at least one predicate and one consequent are required')
	}

	// using fluent interface, we expect the user will call then() before invoking the functor
	if (clauses.length === 1) {
		fluentState = EXPECT_THEN
	} else if (clauses.length % 2 === 1) {
		elseClause = clauses.pop()
	}

	var functor = function() {
		if (fluentState !== OK) {
			throw new Error('missing at least one consequent, you forgot to call then() ?')
		}

		var args = arguments
		var callback = args[args.length - 1]

		if (typeof callback !== 'function') {
			throw new Error('missing callback argument')
		}

		var predicate = clauses.shift()
		
		if (!predicate) {
			return elseClause.apply(null, args)
		}

		var consequent = clauses.shift()
		
		var replacedCallbackArgs = toArray(args)
		replacedCallbackArgs.pop()
		replacedCallbackArgs.push(predicateCallback)

		predicate.apply(null, replacedCallbackArgs)

		function predicateCallback(err, result) {
			if (err) return callback(err)

			if (result) {
				return consequent.apply(null, args)
			} else {
				functor.apply(null, args)
			}
		}
	}

	functor.then = function(fn) {
		if (fluentState !== EXPECT_THEN) {
			throw new Error('not expecting a then() call now')
		}

		fluentState = OK
		clauses.push(fn)
		return functor
	}

	functor.and = function(fn) {
		var predicate = clauses.shift()
		// logical AND using ifAsync
		clauses.push(			
			ifAsync(predicate)
				.then(fn)
				.else(elseFalse)
		)

		return functor
	}

	functor.or = function(fn) {
		var predicate = clauses.shift()
		// logical OR
		clauses.push(
			ifAsync(predicate)
				.then(elseTrue)
				.elseIf(fn)
				.then(elseTrue)
				.else(elseFalse)
		)
		return functor
	}

	functor.else = function(fn) {
		if (fluentState === EXPECT_THEN) {
			throw new Error('only then() may be called after elseIf()')
		}

		elseClause = fn
		return functor
	}

	functor.elseif = functor.elseIf = function(fn) {
		if (fluentState === EXPECT_THEN) {
			throw new Error('only then() may be called after elseIf()')
		}

		clauses.push(fn)

		// allow only then after a call to elseif
		fluentState = EXPECT_THEN
		return functor
	}

	return functor	
}

function elseNoop(callback) {
	setImmediate(callback)
}

function elseTrue(callback) {
	callback(null, true)
}

function elseFalse(callback) {
	callback(null, false)
}

function toArray(args) {
	return Array.prototype.slice.call(args, 0)
}