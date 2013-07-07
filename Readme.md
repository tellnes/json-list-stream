# JSON List Stream

json-list-stream

## Example

```js
var List = require('json-list-stream')

var list = new List()
  , i = 0

list.set('hello', { name: 'World' })
list.write({ 'n': ++i })
list.write({ 'n': ++i })
list.set('count', i)
list.end()

list.pipe(process.stdout)
```

```
$ node example.js

{"hello":{"name":"World"},"rows":[
{"n":1},
{"n":2}
],"count":2}
```

## Install

    $ npm install json-list-stream

## Test

    $ npm test

## License

MIT
