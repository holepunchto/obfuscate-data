# obfuscate-data

Reversibly obfuscate data with a secret key

## Usage

```js
const obf = require('obfuscate-data')

const key = obf.generateKey()

const obfuscated = obf.obfuscate(data, key)
const deobfuscated = obf.deobfuscate(obfuscated, key)
```

## API

### `const key = generateKey()`

Generate a key

### `const payload = obfuscate(data, key)`

Obfuscate `data` using `key`

### `const data = deobfuscate(payload, key)`

Deobfuscate `data` using `key`

## License

Apache-2.0
