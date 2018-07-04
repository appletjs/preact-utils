/**
 * Create a cached version of a pure function.
 *
 * @param {function(string=): *} fn
 * @return {function(string=): *}
 */
export function cached(fn) {
  const cache = Object.create(null);
  return function hitHandle(str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  }
}
