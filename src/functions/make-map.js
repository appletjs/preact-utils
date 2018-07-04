/**
 * Make a map.
 *
 * @param {string} str
 * @param {string|RegExp} separator
 * @return {Object}
 */
export function makeMap(str, separator = ',') {
  const map = Object.create(null);
  const list = str.split(separator);

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return map;
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 *
 * @param {string} str
 * @param {boolean} expectsLowerCase
 * @param {string|RegExp} separator
 * @return {function(*): boolean | undefined}
 */
export function makeMapAccessor(str, expectsLowerCase, separator) {
  const map = makeMap(str, separator);
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val];
}
