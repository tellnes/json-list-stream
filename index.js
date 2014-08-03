
var Transform = require('stream').Transform
  , inherits = require('util').inherits

module.exports = List


function List() {
  if (!(this instanceof List)) return new List()

  Transform.call(this)
  this._writableState.objectMode = true
  this._readableState.objectMode = false

  this._hasHeader = false
  this._footer = null
  this._streaming = false

  this.push('{')
}
inherits(List, Transform)

List.prototype.set = function (key, value) {
  if (typeof key !== 'string')
    throw new Error('`key` must be a string')

  // JSON.stringify(undefined) returns undefined which Readable#push() does not like.
  if (typeof value === 'undefined')
    throw new Error('`value` can not be undefined')

  if (this._streaming) {
    if (!this._footer) this._footer = {}
    this._footer[key] = value
    return
  }

  if (this._hasHeader)
    this.push(',')
  else
    this._hasHeader = true

  this.push(JSON.stringify(key))
  this.push(':')
  this.push(JSON.stringify(value))

  return this
}

List.prototype.pipe = function (res) {
  if (res.setHeader)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return Transform.prototype.pipe.apply(this, arguments)
}

List.prototype._startStreaming = function () {
  if (this._hasHeader)
    this.push(',')

  this.push('"rows":[\n')
}

List.prototype._transform = function (row, chunk, cb) {
  if (!this._streaming) {
    this._startStreaming()
    this._streaming = true

  } else {
    this.push(',\n')
  }

  try {
    row = JSON.stringify(row)
  } catch (err) {
    return cb(err)
  }

  this.push(row)

  cb()
}

List.prototype._flush = function (cb) {
  if (!this._streaming) {
    this._startStreaming()
  }

  this.push('\n]')

  if (this._footer) {
    this.push(',')
    this.push(JSON.stringify(this._footer).slice(1))

  } else {
    this.push('}')
  }

  this.push('\n')

  cb()
}
