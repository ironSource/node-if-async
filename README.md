# if-async
async conditional execution for standalone or async.js use

```javascript
var async = require('async')
var ifAsync = require('if-async')

async.series([
    foo,
    ifAsync(predicateFoo, trueFoo, falseFoo),
    // this also
    ifAsync(predicateFoo).then(trueFoo).else(falseFoo),
    bar
])

function foo(callback) { ... }
function predicateFoo(callback) { callback(null, true) }
function trueFoo(callback) { ... }
function falseFoo(callback) { ... }
function bar(callback) { ... }
```