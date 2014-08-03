var List = require('./')

var list = new List()
  , i = 0

list.set('hello', { name: 'World' })
list.write({ 'n': ++i })
list.write({ 'n': ++i })
list.set('count', i)
list.end()

list.pipe(process.stdout)

/* Outputs:

{"hello":{"name":"World"},"rows":[
{"n":1},
{"n":2}
],"count":2}

*/
