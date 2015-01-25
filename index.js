var util = require('util')

var OK = 0
var THEN = 1

module.exports = function() {

	var clauses = Array.prototype.slice.call(arguments, 0)	
	var elseClause = elseNoop
	var fluentState = OK

	if (clauses.length  === 0) {
		throw new Error('at least one predicate and one consequent are required')
	}

	// using fluent interface, we expect the user will call then() before invoking the functor
	if (clauses.length === 1) {
		fluentState = THEN		
	} else if (clauses.length % 2 === 1) {
		elseClause = clauses.pop()
	}

	var functor = function(callback) {
		if (fluentState !== OK) {
			throw new Error('missing at least one consequent, you forgot to call then() ?')
		}

		var predicate = clauses.shift()
		
		if (!predicate) {
			return elseClause(callback)
		}

		var consequent = clauses.shift()
		
		predicate(function(err, result) {
			if (err) return callback(err)

			if (result) {
				return consequent(callback)
			} else {
				functor(callback)
			}
		})
	}

	functor.then = function(fn) {
		fluentState = OK
		clauses.push(fn)
		return functor
	}

	functor.else = function(fn) {
		if (fluentState === THEN) {
			throw new Error('only then() may be called after elseIf()')
		}

		elseClause = fn
		return functor
	}

	functor.elseif = functor.elseIf = function(fn) {
		if (fluentState === THEN) {
			throw new Error('only then() may be called after elseIf()')
		}

		clauses.push(fn)

		// allow only then after a call to elseif
		fluentState = THEN
		return functor
	}

	return functor	
}

function elseNoop(callback) {
	setImmediate(callback)
}