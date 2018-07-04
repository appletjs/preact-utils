import {cached} from '../functions/cached';

/**
 * Capitalize a string.
 *
 * @type {function(string=): string}
 */
export const capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
