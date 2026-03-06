const b4a = require('b4a')
const c = require('compact-encoding')
const sodium = require('sodium-universal')

const Payload = {
  preencode(state, m) {
    c.buffer.preencode(state, m.data)
    c.fixed(16).preencode(state, m.salt)
  },
  encode(state, m) {
    c.buffer.encode(state, m.data)
    c.fixed(16).encode(state, m.salt)
  },
  decode(state, m) {
    return {
      data: c.buffer.decode(state),
      salt: c.fixed(16).decode(state)
    }
  }
}

module.exports = class Obfuscator {
  static SALTBYTES = 16

  static generateKey() {
    const key = b4a.alloc(sodium.crypto_generichash_KEYBYTES)
    sodium.randombytes_buf(key)

    return key
  }

  static obfuscate(data, key) {
    const salt = b4a.alloc(Obfuscator.SALTBYTES)

    sodium.crypto_generichash(salt, data, key)

    const mask = hash(salt, key, data.byteLength)

    xor(mask, mask, data)

    return c.encode(Payload, { data: mask, salt })
  }

  static deobfuscate(payload, key) {
    const { data, salt } = c.decode(Payload, payload)

    const mask = hash(salt, key, data.byteLength)

    xor(data, data, mask)

    return data
  }
}

function hash(salt, key, length) {
  const hashLength = Math.max(length, sodium.crypto_generichash_BYTES_MIN)
  const buffer = b4a.alloc(hashLength)

  return hashLength === length ? buffer : buffer.subarray(0, length)
}

function xor(result, a, b) {
  if (a.byteLength !== b.byteLength || result.byteLength !== a.byteLength) {
    throw new Error('Expect same length buffers')
  }

  for (let i = 0; i < a.byteLength; i++) {
    result[i] = a[i] ^ b[i]
  }

  return a
}
