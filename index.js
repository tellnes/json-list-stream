
var Transform = require('stream').Transform
  , inherits = require('util').inherits

module.exports = List


function List() {
  if (!(this instanceof List)) return new List()

  Transform.call(this, { writableObjectMode: true, readableObjectMode: false })

  this._header = null
  this._footer = null
  this._streaming = false
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
  } else {
    if (!this._header) this._header = {}
    this._header[key] = value
  }

  return this
}

List.prototype.pipe = function (res) {
  if (res.setHeader)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return Transform.prototype.pipe.apply(this, arguments)
}

List.prototype._startStreaming = function () {
  if (this._header) {
    this.push(JSON.stringify(this._header).slice(0, -1))
    this.push(',')
  } else {
    this.push('{')
  }

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

  this.emit('footer')

  if (this._footer) {
    this.push(',')
    this.push(JSON.stringify(this._footer).slice(1))

  } else {
    this.push('}')
  }

  this.push('\n')

  cb()
}
