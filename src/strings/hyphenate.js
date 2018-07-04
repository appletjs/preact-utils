import {cached} from '../functions/cached';

const hyphenateRE = /\B([A-Z])/g;

/**
 * Hyphenate a camelCase string.
 *
 * @type {function(string=): string}
 */
export const hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});
