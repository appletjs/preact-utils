/**
 * Ensure a function is called only once.
 *
 * @param {Function} fn
 * @return {Function}
 */
export function once(fn) {
  let called = false;
  let result;

  return function () {
    if (!called) {
      called = true;
      result = fn.apply(this, arguments);
    }

    return result;
  };
}
