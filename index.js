(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.preactUtils = {})));
}(this, (function (exports) { 'use strict';

  const {indexOf, splice, join} = [];

  /**
   * 模拟 DOMTokenList 接口，主要用于组件的 class 管理，
   * 类似于 Vue 的绑定 class 方式。
   *
   * 本来打算直接使用 Set，但是谷歌浏览器执行 Set.call 提示错误：
   * "Uncaught TypeError: Constructor Set requires 'new'"，
   * 所以无法实现 class Sub extends Set，才有了该类。
   *
   * @link https://developer.mozilla.org/zh-CN/docs/Web/API/DOMTokenList
   */
  class TokenList {

    /**
     * @param {*} data
     * @return {TokenList}
     */
    static from(data) {
      const list = new TokenList();
      const parsed = this.explode(data);
      parsed.forEach(t => list.add(t));
      return list;
    }

    /**
     * @param {*} value
     * @return {string[]}
     */
    static explode(value) {
      let parsed = [];

      if (value instanceof TokenList) {
        return [...value];
      }

      switch (typeof value) {
        // 'class1'
        // 'class1 class2'
        case 'string':
          parsed = value.trim().split(/\s+/);
          break;

        // arg = () => 'class';
        // arg = () => 'class1 class2';
        // arg = () => ['class1', 'class2'];
        // arg = () => {'class1': true, 'class2': check};
        // arg = () => [{'class1': true}, 'selected', [...]];
        case 'function':
          try {
            const values = value();
            if (!values) break;
            parsed = this.explode(values);
          } catch (e) {
          }
          break;

        // array, object, null
        case 'object':
          if (value == null) {
            break;
          }

          // ['class1', ...]
          // ['class1', {...}]
          if (Array.isArray(value)) {
            parsed = value
              .map(this.explode, this)
              .reduce((x, a) => x.concat(a), []);
            break;

          }

          // {className: check, ...}
          parsed = Object.keys(value)
            .map(key => value[key] && key);

      }

      if (parsed.length) {
        return parsed
          .map(c => c.trim())
          .filter(Boolean)
          .filter(function check(className) {
            if (!/^[a-zA-Z$_-][\w$_-]*$/.test(className)) {
              console.warn(`Bad className "${className}"`);
              return false;
            }
            return true;
          });
      }

      return parsed;
    }

    constructor() {
      this.length = 0;
    }

    /**
     * @param {string[]} tokens
     * @return {TokenList}
     */
    add(...tokens) {
      tokens.forEach(token => {
        if (token == null) return;
        if (this.contains(token)) return;
        this[this.length++] = token;
      });
      return this;
    }

    /**
     * @param {*} token
     * @return {boolean}
     */
    contains(token) {
      return indexOf.call(this, token) > -1;
    }

    item(index) {
      if (index < 0) index += this.length;
      if (index >= this.length) return null;
      return index < 0 ? null : this[index];
    }

    /**
     * @param {*[]} tokens
     */
    remove(...tokens) {
      tokens.forEach(token => {
        const index = indexOf.call(this, token);
        if (index > -1) splice.call(this, index, 1);
      });
    }

    /**
     * 从 TokenList 字符串中移除符号字串（token），并返回 false。
     * 如果传入的符号字串（token）不存在，则将其添加进去，并返回 true
     *
     * @param {string} token
     * @return {boolean}
     */
    toggle(token) {
      const has = this.contains(token);
      this[has ? 'remove' : 'add'](token);
      return has;
    }

    /**
     * @return {string}
     */
    toString() {
      return join.call(this, ' ');
    }
  }

  const partSplitRE = /\s*;(\s*;)+?\s*/;
  const nvSplitRE = /\s*:\s*/;

  // 获取具有浏览器前缀的CSS属性
  const prefixedCssProperties = function (map) {
    const styles = window.getComputedStyle(document.documentElement, '');
    [].slice.call(styles).filter(function (x) {
      const matches = x.match(/-(webkit|moz|ms|o)-/);
      if (matches) map[x.slice(matches[0].length)] = x;
    });
    return map;
  }({});

  function property(name) {
    return prefixedCssProperties[name] || name;
  }

  class StyleMap {
    static from(data) {
      const style = new StyleMap();
      style.dict = this.explode(data);
      return style;
    }

    static explode(data) {
      if (data instanceof StyleMap) {
        return Object.assign({}, data.dict);
      }

      const map = Object.create(null);

      // prop:value;prop2:value2;...
      if (typeof data === 'string') {
        data.split(partSplitRE).forEach(function (part) {
          const [name, value] = part.split(nvSplitRE);
          name && value !== undefined && (map[name] = value);
        });
      }
      // ['name:value', [name, value]...]
      else if (Array.isArray(data)) {
        data.forEach(function (part) {
          if (typeof part === 'string') part = part.split(nvSplitRE);
          if (!Array.isArray(part)) return;
          const [name, value] = part;
          name && value !== undefined && (map[name] = value);
        });
      }
      // {name: value, ...}
      else if (data && typeof data === 'object') {
        Object.keys(data).forEach(function (key) {
          data[key] !== undefined && (map[key] = data[key]);
        });
      }

      return map;
    }

    get size() {
      return Object.keys(this.dict).length;
    }

    constructor() {
      this.dict = Object.create(null);
    }

    append(name, value) {
      this.set(name, (this.has(name) ? this.get(name) + ',' : '') + value);
    }

    get(name) {
      return this.dict[property(name)];
    }

    has(name) {
      return property(name) in this.dict;
    }

    remove(name) {
      return delete this.dict[property(name)];
    }

    set(name, value) {
      this.dict[property(name)] = value;
      return this;
    }

    toString() {
      const styles = [];
      for (const key in this.dict) styles.push(key + ':' + this.dict[key]);
      return styles.join(';') + (this.size ? ';' : '');
    }
  }

  StyleMap.property = property;

  const hasOwn = Object.prototype.hasOwnProperty;

  function without(obj, exclude) {
    const target = {};

    for (const k in obj) {
      if (hasOwn.call(obj, k) && exclude.indexOf(k) === -1) {
        target[k] = obj[k];
      }
    }

    return target;
  }

  function symbol(value) {
    return typeof Symbol !== 'undefined'
      ? Symbol.for(value)
      : `@@${value}@@symbol`;
  }

  function unique(array) {
    return Array.from(new Set(array));
  }

  // 对”\””、”&”、”‘“、”<”、”>”、空格(0x20)、0x00到0x20、0x7F-0xFF
  // 以及0x0100-0x2700的字符进行转义，基本上就覆盖的比较全面了。
  // https://www.cnblogs.com/daysme/p/7100553.html
  const HTML_ENCODE_RE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
  function encodeHTML(str) {
    return String(str).replace(HTML_ENCODE_RE, function ($0) {
      let c = $0.charCodeAt(0);
      let r = ['&#'];
      c = (c === 0x20) ? 0xA0 : c;
      r.push(c);
      r.push(';');
      return r.join('');
    });
  }

  exports.TokenList = TokenList;
  exports.StyleMap = StyleMap;
  exports.without = without;
  exports.symbol = symbol;
  exports.unique = unique;
  exports.encodeHTML = encodeHTML;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
