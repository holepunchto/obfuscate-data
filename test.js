const test = require('brittle')
const b4a = require('b4a')
const { generateKey, obfuscate, deobfuscate, SALTBYTES } = require('./')

test('obfuscate', (t) => {
  const data = b4a.from('nice to meet you')

  const key = generateKey()
  const obfs = obfuscate(data, key)

  t.is(obfs.byteLength, data.byteLength + SALTBYTES + 3)
  t.unlike(obfs.subarray(0, data.byteLength), data)

  const plain = deobfuscate(obfs, key)

  t.alike(plain, data)
})

test('legacy decodes', (t) => {
  const key = b4a.from('8b0735799af6e83fccc3d93962dbea5df4f2b5fea629dfeda4e86e8466e1ab51', 'hex')
  const obfs = b4a.from('106e69636520746f206d65657420796f755ae88a12fc3874441ec6bf499cf2f117', 'hex')

  const exp = b4a.from('nice to meet you')

  const plain = deobfuscate(obfs, key)

  t.alike(plain, exp)
})
