# Zipack.JS

Live demo: https://zipack.github.io/#demo

Zipack.js is an official encoder/decoder of [Zipack](https://zipack.github.io/) format using JavaScript with no dependencies.

## Install

```shell
npm install zipack-official
```

Use ES module in browser or Node.JS:

```JavaScript
import zipack from 'zipack.js'
```

Prototype:

```
zipack {
    serialize(Object)  // code
    parse(Buffer)      // decode
}
```

## Default JS Objects

the types zipack support by default:

- number
- string
- boolean
- Array
- Object (enumerable)
- ArrayBuffer
- null

## Example

```javascript
let obj = {
    number: 123,
    float: 3.14,
    string: 'hello world',
    boolean: true,
    null: null,
    list: [1, 2, 3],
    map: {negative: -123},
    buffer: (new Uint8Array([1,2,3])).buffer
}

// JS Object ---> Uint8Array
let buffer = zipack.serialize(obj)

// Uint8Array ---> JS Object
obj = zipack.parse(buffer)
```

## [Object].prototype.zipack

like toJSON() in JavaScript, define zipack() for specific Objects, which outputs the types zipack support. For example, Date could be stored as number:

- function：zipack
- input：none
- output：default types or Uint8Array

```javascript
Date.prototype.zipack = function () {
  return this.getTime();
};
```

## Extension (experimental)

Register callback(params: Uint8Array) to parse zipack, meanwhile, define zipack() returning Uint8Array to serialize. See [extend-demo.js](./extend_demo.js).
