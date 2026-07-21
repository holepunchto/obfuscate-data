const b4a = require('b4a')
const c = require('compact-encoding')
const sodium = require('sodium-universal')

const Payload = {
  preencode(state, m) {
    c.uint.preencode(state, 0) // sentinel byte
    c.uint.preencode(state, m.version)
    c.buffer.preencode(state, m.data)
    c.fixed(16).preencode(state, m.salt)
  },
  encode(state, m) {
    c.uint.encode(state, 0) // sentinel byte
    c.uint.encode(state, m.version)
    c.buffer.encode(state, m.data)
    c.fixed(16).encode(state, m.salt)
  },
  decode(state, m) {
    const isLegacy = state.buffer[state.start] !== 0 || state.buffer.length === 17

    if (!isLegacy) state.start++

    return {
      version: isLegacy ? 0 : c.uint.decode(state),
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

    return c.encode(Payload, { version: 1, data: mask, salt })
  }

  static deobfuscate(payload, key) {
    const { version, data, salt } = c.decode(Payload, payload)
    if (version === 0) return data // v0 bugged: plaintext

    const mask = hash(salt, key, data.byteLength)

    xor(data, data, mask)

    return data
  }
}

function hash(salt, key, length) {
  const hashLength = Math.max(length, sodium.crypto_generichash_BYTES_MIN)
  const buffer = b4a.alloc(hashLength)

  sodium.crypto_generichash(buffer, salt, key)

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
