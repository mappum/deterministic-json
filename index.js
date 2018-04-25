let stableStringify = require('json-stable-stringify')

const base64Prefix = ':base64:'

// stringifies JSON deterministically, and converts Buffers to
// base64 strings (prefixed with ":base64:")
function stringify (obj) {
  return stableStringify(obj, { replacer: bufferToBase64Replacer })
}

// parses JSON and converts strings with ":base64:" prefix to Buffers
function parse (json) {
  let obj = JSON.parse(json)
  return convertBase64ToBuffers(obj)
}

// converts Buffers to base64 strings in-place
function convertBuffersToBase64 (obj) {
  return replace(obj, bufferToBase64Replacer)
}

// converts base64 strings to Buffers in-place
function convertBase64ToBuffers (obj) {
  return replace(obj, base64ToBufferReplacer)
}

// converts buffer to base64 and strips trailing equals chars
function bufferToBase64 (buffer) {
  let actualLength = Math.floor(buffer.length / 3) * 4 + 2
  return buffer.toString('base64').slice(0, actualLength)
}

function bufferToBase64Replacer (key, value) {
  // convert JSON.stringified Buffer objects to Buffer,
  // so they can get encoded to base64
  if (
    typeof value === 'object' &&
    value != null &&
    value.type === 'Buffer' &&
    Array.isArray(value.data)
  ) {
    value = Buffer.from(value)
  }
  if (!Buffer.isBuffer(value)) return value
  return `${base64Prefix}${bufferToBase64(value)}`
}

function base64ToBufferReplacer (key, value) {
  if (typeof value !== 'string') return value
  if (!value.startsWith(base64Prefix)) return value
  return Buffer.from(value.slice(base64Prefix.length), 'base64')
}

function replace (obj, replacer) {
  for (let key in obj) {
    obj[key] = replacer(key, obj[key])
    if (typeof obj[key] === 'object' && !Buffer.isBuffer(obj[key])) {
      // recursively replace props of objects (unless it's a Buffer)
      replace(obj[key], replacer)
    }
  }
  return obj
}

module.exports = {
  stringify,
  parse,
  convertBuffersToBase64,
  convertBase64ToBuffers
}
