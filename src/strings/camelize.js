import {cached} from '../functions/cached';

const camelizeRE = /-(\w)/g;

/**
 * Camelize a hyphen-delimited string.
 * @type {function(string=): string}
 */
export const camelize = cached(function (str) {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
});
