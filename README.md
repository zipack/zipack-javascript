# zipack

## Usage

```JavaScript
import zipack from 'zipack.js'

zipack {
    serialize(Object)  // code
    parse(Buffer)      // decode
}
```

## default JS Objects

the types zipack support by default:

- number
- string
- boolean
- Array
- Object (enumerable)
- ArrayBuffer
- null

## code

JS Object ---> Uint8Array

## decode

Uint8Array ---> JS Object

## Example

```javascript
parse(serialize({
    number: 123,
    float: 3.14,
    string: 'hello world',
    boolean: true,
    null: null,
    list: [1, 2, 3],
    map: {negative: -123},
    buffer: new Uint8Array([1,2,3]) .buffer,
}))
```

## Object.prototype.zipack

like toJSON() in JavaScript, define zipack() for specific Objects, which outputs the types zipack support.
for example, Date could be stored as number:

- function：zipack
- input：none
- output：default types or Uint8Array

```javascript
Date.prototype.zipack = function () {
  return this.getTime();
};

```

## Extension(experimental)

register callback(params: Uint8Array) to parse zipack, meanwhile, define zipack() returning Uint8Array to serialize. [Demo](./extend_demo.js)
