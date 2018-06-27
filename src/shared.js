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

export function symbol(value) {
  return typeof Symbol !== 'undefined'
    ? Symbol.for(value)
    : `@@${value}@@symbol`;
}

export function unique(array) {
  return Array.from(new Set(array));
}

// 对”\””、”&”、”‘“、”<”、”>”、空格(0x20)、0x00到0x20、0x7F-0xFF
// 以及0x0100-0x2700的字符进行转义，基本上就覆盖的比较全面了。
// https://www.cnblogs.com/daysme/p/7100553.html
const HTML_ENCODE_RE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
export function encodeHTML(str) {
  return String(str).replace(HTML_ENCODE_RE, function ($0) {
    let c = $0.charCodeAt(0);
    let r = ['&#'];
    c = (c === 0x20) ? 0xA0 : c;
    r.push(c);
    r.push(';');
    return r.join('');
  });
}
