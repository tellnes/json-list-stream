var List = require('./')
  , assert = require('assert')
  , concat = require('concat-stream')

function test(body, fn) {
  var list = new List()

  list.pipe(concat(function (data) {
    data = String(data)
    assert.deepEqual(JSON.parse(data), body)
    assert.equal(data.replace(/\n/g, ''), JSON.stringify(body))
  }))

  fn(list)
}

test(
  { rows: [] }
, function (list) {
    list.end()
  }
)

test(
  {'a': 'b', rows: [] }
, function (list) {
    list.set('a', 'b')
    list.end()
  }
)

test(
  {'a': 'b', 'rows': [{'n': 1}]}
, function (list) {
    list.set('a', 'b')
    list.write({ 'n': 1 })
    list.end()
  }
)

test(
  {'a': 'b', 'rows': [{'n': 1}], 'c': 'd'}
, function (list) {
    list.set('a', 'b')
    list.write({ 'n': 1 })
    list.set('c', 'd')
    list.end()
  }
)

test(
  {'a': 'b', 'rows': [{'n': 1},{'n': 2}], 'c': 'd'}
, function (list) {
    list.set('a', 'b')
    list.write({ 'n': 1 })
    list.write({ 'n': 2 })
    list.set('c', 'd')
    list.end()
  }
)

test(
  {'rows': [{'n': 1}], 'c': 'd'}
, function (list) {
    list.write({ 'n': 1 })
    list.set('c', 'd')
    list.end()
  }
)

test(
  {'rows': [{'n': 1}]}
, function (list) {
    list.write({ 'n': 1 })
    list.end()
  }
)

test(
  {'rows': [{'n': 1},{'n': 2}]}
, function (list) {
    list.write({ 'n': 1 })
    list.write({ 'n': 2 })
    list.end()
  }
)

test(
  {'a': 'b', 'c': 'd', 'rows': []}
, function (list) {
    list.set('a', 'b')
    list.set('c', 'd')
    list.end()
  }
)

test(
  {'rows': [{'n': 1}], 'a': 'b', 'c': 'd'}
, function (list) {
    list.write({ 'n': 1 })
    list.set('a', 'b')
    list.set('c', 'd')
    list.end()
  }
)

var list = new List()
list.on('footer', () => list.set('foo', 'bar'))
list.pipe(concat((data) => {
  data = String(data)
  assert.deepEqual(JSON.parse(data), { rows: [], foo: 'bar' })
}))
list.end()
