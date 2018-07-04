/**
 * Get the raw type string of a value e.g. [object Object]
 */
const _toString = Object.prototype.toString;

export function isUndefined(v) {
  return v === undefined || v === null;
}

export function isDefined(v) {
  return v !== undefined && v !== null;
}

export function isTrue(v) {
  return v === true;
}

export function isFalse(v) {
  return v === false;
}

/**
 * Check if value is primitive
 *
 * @param {*} value
 * @return {boolean}
 */
export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  );
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param obj
 * @return {boolean}
 */
export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * @param value
 * @return {string}
 */
export function toRawType(value) {
  return _toString.call(value).slice(8, -1);
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param obj
 * @return {boolean}
 */
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

/**
 * @param v
 * @return {boolean}
 */
export function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]';
}

/**
 * Check if val is a valid array index.
 *
 * @param val
 * @return {boolean}
 */
export function isValidArrayIndex(val) {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

/**
 * Convert a value to a string that is actually rendered.
 *
 * @param val
 * @return {string}
 */
export function toString(val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val);
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 *
 * @param {string} val
 * @return {number|string}
 */
export function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
}

export function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

export function isPreactElement(node) {
  return node && (node.__preactattr_ != null || (typeof Symbol !== 'undefined' && node[Symbol.for('preactattr')] != null));
}
