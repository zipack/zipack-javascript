Date.prototype.zipack = function () {
  return this.getTime();
};

RegExp.prototype.zipack = function () {
  return this.toString();
};

URL.prototype.zipack = function () {
  return this.toString();
};

HTMLElement.prototype.zipack = function () {
  return this.outerHTML;
};

// extend zipack using undefined prefix

const { _undefined, _undefined_0, _undefined_1, typeTable } = zipack.extension;
class Uint8 {
  constructor(num) {
    if (num < 0 || num > 255) throw "number out of size";
    this.num = num;
  }
  zipack() {
    return new Uint8Array([_undefined[0], this.num]);
  }
}
typeTable[_undefined[0]] = (zipack) => {
  zipack.index += 2;
  return zipack[zipack.index - 1];
};
