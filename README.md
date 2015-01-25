# if-async
async conditional execution for standalone or async.js use

### Example 1: Using with Async.js

```javascript
var async = require('async')
var ifAsync = require('if-async')

async.series([
    foo,
    ifAsync(predicate1).then(consequent1).else(else1),
    bar
])

function foo(callback) { ... }
function predicate1(callback) { fs.stat(... callback ...) }
function consequent1(callback) { ... }
function else1(callback) { ... }
function bar(callback) { ... }
```

### Example 2: Standalone usage

```javascript
var ifAsync = require('if-async')

var functor = ifAsync(predicate).then(consequent).else(elseClause)

functor(function(err) {
    console.log('done')
})

function predicate(callback) { fs.stat(... callback ...) }
function consequent(callback) { ... }
function elseClause(callback) { ... }
```


### API Reference

#### Using fluent interface

var functor = ifAsync(predicate1).then(consequent1).elseIf(predicate2).then(consequent2).else(defaultConsequent)

#### Using function arguments

var functor = ifAsync(predicate1, consequent1, predicate2, consequent2, defaultConsequent)