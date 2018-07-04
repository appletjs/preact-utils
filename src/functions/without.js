const hasOwn = Object.prototype.hasOwnProperty;

export function without(obj, exclude) {
  const target = {};

  for (const k in obj) {
    if (hasOwn.call(obj, k) && exclude.indexOf(k) === -1) {
      target[k] = obj[k];
    }
  }

  return target;
}
