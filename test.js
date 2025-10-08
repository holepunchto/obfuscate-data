const test = require('brittle')
const b4a = require('b4a')
const { generateKey, obfuscate, deobfuscate, SALTBYTES } = require('./')

test('obfuscate', (t) => {
  const data = b4a.from('nice to meet you')

  const key = generateKey()
  const obfs = obfuscate(data, key)

  t.is(obfs.byteLength, data.byteLength + SALTBYTES + 1)
  t.unlike(obfs.subarray(0, data.byteLength), data)

  const plain = deobfuscate(obfs, key)

  t.alike(plain, data)
})
