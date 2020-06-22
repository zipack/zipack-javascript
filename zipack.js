// The operands of all bitwise operators are converted to signed 32-bit integers in two's complement format, except for zero-fill right shift which results in an unsigned 32-bit integer.

const typeTable = Array.from({ length: 256 });

const _nature_0 = 0b0000_0000;
const _nature_1 = 0b0111_1111;
const _positive_integer = 0b1111_1000;
const _negative_integer = 0b1111_1001;
const _positive_precision = 0b1111_0010;
const _negative_precision = 0b1111_0011;
const _string = 0b1111_0101;
const _string_0 = 0b1000_0000;
const _string_1 = 0b1001_1111;
const _list = 0b1111_0110;
const _list_0 = 0b1010_0000;
const _list_1 = 0b1011_1111;
const _map = 0b1111_0111;
const _map_0 = 0b1100_0000;
const _map_1 = 0b1101_1111;
const _true = 0b1111_0000;
const _false = 0b1111_0001;
const _null = 0b1111_1010;
const _bytes = 0b1111_0100;
const _undefined = [
  0b1111_1011,
  0b1111_1100,
  0b1111_1101,
  0b1111_1110,
  0b1111_1111,
];
const _undefined_0 = 0b1110_0000;
const _undefined_1 = 0b1110_1111;

const r7 = 2 ** 7;
const r14 = 2 ** 14;
const r21 = 2 ** 21;
const r28 = 2 ** 28;
const r35 = 2 ** 35;
const r42 = 2 ** 42;
const R7 = r7;
const R14 = r14 + r7;
const R21 = r21 + r14 + r7;
const R28 = r28 + r21 + r14 + r7;
const R35 = r35 + r28 + r21 + r14 + r7;
const R42 = r42 + r35 + r28 + r21 + r14 + r7;

const r = [1, r7, r14, r21, r28, r35, r42];
const R = [0, R7, R14, R21, R28, R35, R42];

// 输入自然数，输出偏移的vlq
function nature2vlq(number) {
  let tobeUint8Array;

  R.find((RR, index) => {
    if (number < RR) {
      const faceValue = number - R[index - 1];

      tobeUint8Array = Array.from({ length: index })
        .map((x, i) => (faceValue / r[i]) % r7 | (i ? r7 : 0))
        .reverse();

      return true;
    } else {
      return false;
    }
  });

  return new Uint8Array(tobeUint8Array);
}

// 从zipack的index开始建立一个vlq字节串，输出自然数（带偏移）
function vlq2nature(zipack) {
  const start = zipack.index;
  while (true) {
    if (zipack[zipack.index] < r7) break;
    zipack.index++;
  }
  zipack.index++;
  const vlq = zipack.slice(start, zipack.index);
  return (
    vlq
      .map((x) => x & (r7 - 1))
      .reduce((sum, next, i) => {
        sum += next * r[vlq.length - i - 1];
        return sum;
      }, 0) + R[vlq.length - 1]
  );
}

// 由多个vlq自然数组成的string
function string2vlqs(string) {
  const tobeUint8Array = Array.from({ length: string.length })
    .map((x, i) => {
      const char = nature2vlq(string.codePointAt(i));
      return [...char];
    })
    .flat();
  return Uint8Array.from(tobeUint8Array);
}

// （不含前缀）
function vlqs2string(zipack, length) {
  const codePoints = Array.from({ length }).map(() => vlq2nature(zipack));
  return String.fromCodePoint(...codePoints);
}

/* ******************************************************************************************************************* */
/* ******************************************************************************************************************* */

// 小自然数
const miniNatural = (zipack) => {
  return zipack[zipack.index++];
};
let i = _nature_0;
while (i <= _nature_1) {
  typeTable[i] = miniNatural;
  i++;
}

// 小字典
const miniMap = (zipack) => {
  const length = zipack[zipack.index] & 0b0001_1111;
  zipack.index++;

  const map = Object.fromEntries(
    Array.from({ length }).map(() => {
      const keyLength = vlq2nature(zipack);
      const key = vlqs2string(zipack, keyLength);
      const value = typeTable[zipack[zipack.index]](zipack);

      return [key, value];
    })
  );

  return map;
};
i = _map_0;
while (i <= _map_1) {
  typeTable[i] = miniMap;
  i++;
}

// VLQ字典
typeTable[_map] = (zipack) => {
  zipack.index++;
  const length = vlq2nature(zipack) + 32;

  const map = Object.fromEntries(
    Array.from({ length }).map(() => {
      const keyLength = vlq2nature(zipack);
      const key = vlqs2string(zipack, keyLength);
      const value = typeTable[zipack[zipack.index]](zipack);

      return [key, value];
    })
  );

  return map;
};

// 小列表
const miniList = (zipack) => {
  const length = zipack[zipack.index] & 0b0001_1111;
  zipack.index++;
  const list = Array.from({ length }).map(() =>
    typeTable[zipack[zipack.index]](zipack)
  );
  return list;
};
i = _list_0;
while (i <= _list_1) {
  typeTable[i] = miniList;
  i++;
}

// VLQ列表
typeTable[_list] = (zipack) => {
  zipack.index++;
  const length = vlq2nature(zipack) + 32;
  const list = Array.from({ length }).map(() =>
    typeTable[zipack[zipack.index]](zipack)
  );
  return list;
};

// 小字符串
const miniString = (zipack) => {
  const length = zipack[zipack.index] & 0b0001_1111;
  zipack.index++;
  return vlqs2string(zipack, length);
};
i = _string_0;
while (i <= _string_1) {
  typeTable[i] = miniString;
  i++;
}

// VLQ字符串
typeTable[_string] = (zipack) => {
  zipack.index++;
  const length = vlq2nature(zipack) + 32;
  return vlqs2string(zipack, length);
};

// VLQ字节流
typeTable[_bytes] = (zipack) => {
  zipack.index++;
  const length = vlq2nature(zipack);
  const start = zipack.index;
  zipack.index += length;
  return zipack.slice(start, zipack.index).buffer;
};

// VLQ正整数
typeTable[_positive_integer] = (zipack) => {
  zipack.index++;
  const result = r7 + vlq2nature(zipack);

  return result;
};

// VLQ负整数
typeTable[_negative_integer] = (zipack) => {
  zipack.index++;
  const result = -1 - vlq2nature(zipack);
  return result;
};

// 正负小数
const precision = (zipack) => {
  zipack.index++;
  const integer = vlq2nature(zipack);
  const precision = vlq2nature(zipack) + 1;
  const precision0b = precision.toString(2);
  const exponent = precision0b.length;
  const precisionReversed = parseInt(
    precision0b.split("").reverse().join(""),
    2
  );
  const result = integer + precisionReversed * 2 ** -exponent;
  return result;
};
typeTable[_positive_precision] = (zipack) => precision(zipack);
typeTable[_negative_precision] = (zipack) => -precision(zipack);

// null
typeTable[_null] = (zipack) => {
  zipack.index++;
  return null;
};

// true
typeTable[_true] = (zipack) => {
  zipack.index++;
  return true;
};

// false
typeTable[_false] = (zipack) => {
  zipack.index++;
  return false;
};

/* ******************************************************************************************************************* */
/* ******************************************************************************************************************* */

function encodeNumber(num) {
  // 整数
  if (num % 1 === 0) {
    // 自然数
    if (num >= 0) {
      // 小自然数
      if (num < r7) {
        return new Uint8Array([num]);
        // 正整数
      } else {
        return Uint8Array.from([_positive_integer, ...nature2vlq(num - r7)]);
      }
      // 负整数
    } else {
      return Uint8Array.from([_negative_integer, ...nature2vlq(-num - 1)]);
    }
  } else {
    // 正负小数
    const absolute = Math.abs(num);
    const integer = Math.floor(absolute);
    const precision = absolute.toString(2).split(".")[1];
    const precisionParsed = parseInt(
      precision.slice(0, 20).split("").reverse().join(""),
      2
    );
    return Uint8Array.from([
      num > 0 ? _positive_precision : _negative_precision,
      ...nature2vlq(integer),
      ...nature2vlq(precisionParsed - 1),
    ]);
  }
}

//
function encodeString(string) {
  // 小字符串还是大字符串
  const tobeUint8Array =
    string.length < 32
      ? [_string_0 | string.length]
      : [_string, ...nature2vlq(string.length - 32)];

  string.split("").forEach((char) => {
    tobeUint8Array.push(...nature2vlq(char.codePointAt(0)));
  });
  return Uint8Array.from(tobeUint8Array);
}

//
function encodeList(list, layer) {
  layer++;
  if (layer > 50) throw new Error("嵌套层数溢出");

  // 小列表还是大列表
  const tobeUint8Array =
    list.length < 32
      ? [_list_0 | list.length]
      : [_list, [...nature2vlq(list.length - 32)]];

  list.forEach((o) => {
    tobeUint8Array.push(...encode(o, layer));
  });
  return Uint8Array.from(tobeUint8Array);
}

//
function encodeMap(map, layer) {
  layer++;
  if (layer > 50) throw new Error("嵌套层数溢出");

  const keyValues = Object.entries(map);

  // 小字典还是大字典
  const tobeUint8Array =
    keyValues.length < 32
      ? [_map_0 | keyValues.length]
      : [_map, ...nature2vlq(keyValues.length - 32)];

  keyValues.forEach(([k, v]) => {
    tobeUint8Array.push(...nature2vlq(k.length));
    tobeUint8Array.push(...string2vlqs(k));
    tobeUint8Array.push(...encode(v, layer));
  });
  return Uint8Array.from(tobeUint8Array);
}

function encode(obj, layer) {
  const type = typeof obj;
  if (type === "number") {
    return encodeNumber(obj);
  } else if (type === "string") {
    return encodeString(obj);
  } else if (type === "boolean") {
    return new Uint8Array([obj ? _true : _false]);
  } else if (!obj) {
    // null undefined
    return new Uint8Array([_null]);
  } else if (obj.constructor === Array) {
    return encodeList(obj, layer);
  } else if (obj.constructor === Object) {
    return encodeMap(obj, layer);
  } else if (obj.constructor === ArrayBuffer) {
    const byteLength = nature2vlq(obj.byteLength);
    const buffer = new Uint8Array(obj);
    return Uint8Array.from([_bytes, ...byteLength, ...buffer]);
  } else if (obj.zipack) {
    const result = obj.zipack();
    if (result instanceof Uint8Array) return result;
    else return encode(result, layer);
  } else {
    const description = obj.toString
      ? obj.toString()
      : Object.prototype.toString.call(obj);
    return encode(description, layer);
  }
}

/* ******************************************************************************************************************* */
/* ******************************************************************************************************************* */

export default {
  parse(zipack) {
    zipack.index = 0;
    return typeTable[zipack[zipack.index]](zipack);
  },
  serialize(obj) {
    const layer = 0;
    return encode(obj, layer);
  },
  extension: { _undefined, _undefined_0, _undefined_1, typeTable },
};
