module.exports = function(predicate, trueFn, falseFn) {

	var functor = function(callback) {
		predicate(function(err, result) {
			if (err) return callback(err)

			if (result) {
				return trueFn(callback)
			} else {
				return falseFn(callback)
			}
		})
	}

	functor.then = function (fn) { 
		trueFn = fn
		return this
	}

	functor.else = function (fn) { 
		falseFn = fn
		return this
	}

	return functor
}
