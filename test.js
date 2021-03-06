let test = require('tape')
let json = require('.')

test('stringify', (t) => {
  t.test('json stringification has deterministic order', (t) => {
    let obj = { c: 5, a: 3, b: 4, '0': { b: 2, a: 1 } }
    let stringified = json.stringify(obj)
    t.equal(
      stringified,
      '{"0":{"a":1,"b":2},"a":3,"b":4,"c":5}',
      'correct json output')
    t.end()
  })

  t.test('Buffers get encoded to base64 strings', (t) => {
    let obj = { data: Buffer.from('base64 me plz'), foo: 'bar' }
    let stringified = json.stringify(obj)
    t.equal(
      stringified,
      '{"data":":base64:YmFzZTY0IG1lIHBseg","foo":"bar"}',
      'correct json output')
    t.end()
  })

  t.test('original object not mutated', (t) => {
    let obj = { data: Buffer.from('base64 me plz'), foo: 'bar' }
    json.stringify(obj)
    t.ok(obj.data instanceof Buffer, 'data is still a Buffer')
    t.end()
  })

  t.test('Buffer.toJSON() values get encoded to base64 strings', (t) => {
    let obj = { data: Buffer.from('base64 me plz').toJSON(), foo: 'bar' }
    let stringified = json.stringify(obj)
    t.equal(
      stringified,
      '{"data":":base64:YmFzZTY0IG1lIHBseg","foo":"bar"}',
      'correct json output')
    t.end()
  })

  t.test('stringifying arrays works', (t) => {
    let arr = [ Buffer.from('base64 me plz') ]
    let stringified = json.stringify(arr)
    t.equal(
      stringified,
      '[":base64:YmFzZTY0IG1lIHBseg"]',
      'correct json output')
    t.end()
  })

  t.end()
})

test('parse', (t) => {
  t.test('base64 strings convert to Buffers', (t) => {
    let stringified = '{"data":":base64:YmFzZTY0IG1lIHBseg","foo":"bar"}'
    let obj = json.parse(stringified)
    t.ok(obj.data.equals(Buffer.from('base64 me plz')), 'correct Buffer value')
    t.equal(obj.foo, 'bar', 'correct string value')
    t.end()
  })

  t.end()
})

test('convertBuffersToBase64', (t) => {
  t.test('Buffers get encoded to base64 strings', (t) => {
    let obj = {
      data: Buffer.from('base64 me plz'),
      foo: 'bar'
    }
    json.convertBuffersToBase64(obj)
    t.equal(
      obj.data,
      ':base64:YmFzZTY0IG1lIHBseg',
      'correct base64 string value')
    t.equal(obj.foo, 'bar', 'correct string value')
    t.end()
  })

  t.test('Buffer.toJSON() values get encoded to base64 strings', (t) => {
    let obj = {
      data: Buffer.from('base64 me plz').toJSON(),
      foo: 'bar',
      x: null
    }
    json.convertBuffersToBase64(obj)
    t.equal(
      obj.data,
      ':base64:YmFzZTY0IG1lIHBseg',
      'correct base64 string value')
    t.equal(obj.foo, 'bar', 'correct string value')
    t.end()
  })

  t.end()
})

test('convertBase64ToBuffers', (t) => {
  t.test('base64 strings convert to Buffers', (t) => {
    let obj = {
      data: ':base64:YmFzZTY0IG1lIHBseg',
      foo: 'bar',
      baz: 123,
      x: null,
      recursive: { data: ':base64:YmFzZTY0IG1lIHBseg' }
    }
    json.convertBase64ToBuffers(obj)
    t.equal(
      obj.data.toString('utf8'),
      'base64 me plz',
      'correct base64 string value')
    t.equal(
      obj.recursive.data.toString('utf8'),
      'base64 me plz',
      'correct base64 string value')
    t.equal(obj.foo, 'bar', 'correct string value')
    t.end()
  })

  t.end()
})

test('base64 has no trailing equals', (t) => {
  let stringified = json.stringify([
    Buffer.from('test 1'),
    Buffer.from('test 12'),
    Buffer.from('test 123'),
    Buffer.from('test 1234')
  ])
  t.equal(stringified, '[":base64:dGVzdCAx",":base64:dGVzdCAxMg",":base64:dGVzdCAxMj",":base64:dGVzdCAxMjM0"]')
  t.end()
})
