(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.preactUtils = {})));
}(this, (function (exports) { 'use strict';

  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

  /**
   * Create a cached version of a pure function.
   *
   * @param {function(string=): *} fn
   * @return {function(string=): *}
   */
  function cached(fn) {
    var cache = Object.create(null);
    return function hitHandle(str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str));
    }
  }

  /**
   * Get the raw type string of a value e.g. [object Object]
   */
  var _toString = Object.prototype.toString;

  function isUndefined(v) {
    return v === undefined || v === null;
  }

  function isDefined(v) {
    return v !== undefined && v !== null;
  }

  function isTrue(v) {
    return v === true;
  }

  function isFalse(v) {
    return v === false;
  }

  /**
   * Check if value is primitive
   *
   * @param {*} value
   * @return {boolean}
   */
  function isPrimitive(value) {
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
  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  /**
   * @param value
   * @return {string}
   */
  function toRawType(value) {
    return _toString.call(value).slice(8, -1);
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   *
   * @param obj
   * @return {boolean}
   */
  function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]';
  }

  /**
   * @param v
   * @return {boolean}
   */
  function isRegExp(v) {
    return _toString.call(v) === '[object RegExp]';
  }

  /**
   * Check if val is a valid array index.
   *
   * @param val
   * @return {boolean}
   */
  function isValidArrayIndex(val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val);
  }

  /**
   * Convert a value to a string that is actually rendered.
   *
   * @param val
   * @return {string}
   */
  function toString(val) {
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
  function toNumber(val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n;
  }

  function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
  }

  function isPreactElement(node) {
    return node && (node.__preactattr_ != null || (typeof Symbol !== 'undefined' && node[Symbol.for('preactattr')] != null));
  }

  /**
   * Make a map.
   *
   * @param {string} str
   * @param {string|RegExp} separator
   * @return {Object}
   */
  function makeMap(str, separator) {
    if ( separator === void 0 ) separator = ',';

    var map = Object.create(null);
    var list = str.split(separator);

    for (var i = 0; i < list.length; i++) {
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
  function makeMapAccessor(str, expectsLowerCase, separator) {
    var map = makeMap(str, separator);
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; };
  }

  function noop() {
    // nothing
  }

  var callbacks = [];
  var pending = false;

  function handleError(err) {
    if ((inBrowser || inWeex) && typeof console !=='undefined') {
      err.message = "Error in nextTick: " + (err.message);
      console.error(err);
    } else {
      throw err;
    }
  }

  function flushCallbacks() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      var task = copies[i];
      if (useMacroTask && task._withTask) {
        task._withTask();
      } else {
        task();
      }
    }
  }

  // Here we have async deferring wrappers using both microtasks and (macro) tasks.
  // In < 2.4 we used microtasks everywhere, but there are some scenarios where
  // microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690) or even between bubbling of the same
  // event (#6566). However, using (macro) tasks everywhere also has subtle problems
  // when state is changed right before repaint (e.g. #6813, out-in transitions).
  // Here we use microtask by default, but expose a way to force (macro) task when
  // needed (e.g. in event handlers attached by v-on).
  var microTimerFunc;
  var macroTimerFunc;
  var useMacroTask = false;

  // Determine (macro) task defer implementation.
  // Technically setImmediate should be the ideal choice, but it's only available
  // in IE. The only polyfill that consistently queues the callback after all DOM
  // events triggered in the same loop is by using MessageChannel.
  /* istanbul ignore if */
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    macroTimerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else if (typeof MessageChannel !== 'undefined'
    && (isNative(MessageChannel) ||
      // PhantomJS
      MessageChannel.toString() === '[object MessageChannelConstructor]'
    )
  ) {
    var channel = new MessageChannel();
    var port = channel.port2;
    channel.port1.onmessage = flushCallbacks;
    macroTimerFunc = function() {
      port.postMessage(1);
    };
  } else {
    /* istanbul ignore next */
    macroTimerFunc = function() {
      setTimeout(flushCallbacks, 0);
    };
  }

  // Determine microtask defer implementation.
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    microTimerFunc = function() {
      p.then(flushCallbacks);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else {
    // fallback to macro
    microTimerFunc = macroTimerFunc;
  }

  /**
   * Wrap a function so that if any code inside triggers state change,
   * the changes are queued using a (macro) task instead of a microtask.
   *
   * @param {Function} fn
   * @return {Function}
   */
  function withMacroTask(fn) {
    return fn._withTask || (fn._withTask = function () {
      useMacroTask = true;
      var res = fn.apply(null, arguments);
      useMacroTask = false;
      return res;
    });
  }

  /**
   * @param {Function} [cb]
   * @param {Object} [ctx]
   */
  function nextTick(cb, ctx){
    var _resolve;

    callbacks.push(function() {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          if (ctx && typeof ctx.handleError === 'function') {
            ctx.handleError(e);
          } else {
            handleError(e);
          }
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });

    if (!pending) {
      pending = true;

      if (useMacroTask) {
        macroTimerFunc();
      } else {
        microTimerFunc();
      }
    }

    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      });
    }
  }

  /**
   * Ensure a function is called only once.
   *
   * @param {Function} fn
   * @return {Function}
   */
  function once(fn) {
    var called = false;
    var result;

    return function () {
      if (!called) {
        called = true;
        result = fn.apply(this, arguments);
      }

      return result;
    };
  }

  var hasOwn = Object.prototype.hasOwnProperty;

  function without(obj, exclude) {
    var target = {};

    for (var k in obj) {
      if (hasOwn.call(obj, k) && exclude.indexOf(k) === -1) {
        target[k] = obj[k];
      }
    }

    return target;
  }

  // 对”\””、”&”、”‘“、”<”、”>”、空格(0x20)、0x00到0x20、0x7F-0xFF
  // 以及0x0100-0x2700的字符进行转义，基本上就覆盖的比较全面了。
  // https://www.cnblogs.com/daysme/p/7100553.html
  var HTML_ENCODE_RE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;

  function encodeHTML(str) {
    return String(str).replace(HTML_ENCODE_RE, function ($0) {
      var c = $0.charCodeAt(0);
      var r = ['&#'];
      c = (c === 0x20) ? 0xA0 : c;
      r.push(c);
      r.push(';');
      return r.join('');
    });
  }

  function parseSlots(children) {
    var slots = {};

    if (Array.isArray(children)) {
      children.forEach(function (child) {
        if (child == null) { return; }
        var attrs = child.attributes;
        var name = attrs && attrs.slot || 'default';
        (slots[name] || (slots[name] = [])).push(child);
      });
    }

    return slots;
  }

  var partSplitRE = /\s*;\s*/;
  var nvSplitRE = /\s*:\s*/;

  // 获取具有浏览器前缀的CSS属性
  var prefixedCssProperties = function (map) {
    var styles = window.getComputedStyle(document.documentElement, '');
    [].slice.call(styles).filter(function (x) {
      var matches = x.match(/-(webkit|moz|ms|o)-/);
      if (matches) { map[x.slice(matches[0].length)] = x; }
    });
    return map;
  }({});

  function property(name) {
    return prefixedCssProperties[name] || name;
  }

  var StyleMap = function StyleMap() {
    this.dict = Object.create(null);
  };

  var prototypeAccessors = { size: { configurable: true } };

  StyleMap.from = function from (data) {
    var style = new StyleMap();
    style.dict = this.explode(data);
    return style;
  };

  StyleMap.explode = function explode (data) {
    if (data instanceof StyleMap) {
      return Object.assign({}, data.dict);
    }

    var map = Object.create(null);

    // prop:value;prop2:value2;...
    if (typeof data === 'string') {
      data.split(partSplitRE).forEach(function (part) {
        if (!part.trim()) { return; }
        var ref = part.split(nvSplitRE);
          var name = ref[0];
          var value = ref[1];
        name && value !== undefined && (map[name] = value);
      });
    }
    // ['name:value', [name, value]...]
    else if (Array.isArray(data)) {
      data.forEach(function (part) {
        if (typeof part === 'string') { part = part.split(nvSplitRE); }
        if (!Array.isArray(part)) { return; }
        var name = part[0];
          var value = part[1];
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
  };

  prototypeAccessors.size.get = function () {
    return Object.keys(this.dict).length;
  };

  StyleMap.prototype.append = function append (name, value) {
    this.set(name, (this.has(name) ? this.get(name) + ',' : '') + value);
    return this;
  };

  StyleMap.prototype.get = function get (name) {
    return this.dict[property(name)];
  };

  StyleMap.prototype.has = function has (name) {
    return property(name) in this.dict;
  };

  StyleMap.prototype.remove = function remove (name) {
    return delete this.dict[property(name)];
  };

  StyleMap.prototype.set = function set (name, value) {
    this.dict[property(name)] = value;
    return this;
  };

  StyleMap.prototype.toString = function toString () {
      var this$1 = this;

    var styles = [];
    for (var key in this$1.dict) { styles.push(key + ':' + this$1.dict[key]); }
    return styles.join(';') + (this.size ? ';' : '');
  };

  Object.defineProperties( StyleMap.prototype, prototypeAccessors );

  StyleMap.property = property;

  var ref = [];
  var indexOf = ref.indexOf;
  var splice = ref.splice;
  var join = ref.join;

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
  var TokenList = function TokenList() {
    this.length = 0;
  };

  /**
   * @param {any[]} tokens
   * @return {TokenList}
   */
  TokenList.from = function from (data) {
    var list = new TokenList();
    var parsed = this.explode(data);
    parsed.forEach(function (t) { return list.add(t); });
    return list;
  };

  /**
   * @param {*} value
   * @return {string[]}
   */
  TokenList.explode = function explode (value) {
    var parsed = [];

    if (value instanceof TokenList) {
      return [].concat( value );
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
          var values = value();
          if (!values) { break; }
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
            .reduce(function (x, a) { return x.concat(a); }, []);
          break;

        }

        // {className: check, ...}
        parsed = Object.keys(value)
          .map(function (key) { return value[key] && key; });

    }

    if (parsed.length) {
      return parsed
        .map(function (c) { return c.trim(); })
        .filter(Boolean)
        .filter(function check(className) {
          if (!/^[a-zA-Z$_-][\w$_-]*$/.test(className)) {
            console.warn(("Bad className \"" + className + "\""));
            return false;
          }
          return true;
        });
    }

    return parsed;
  };

  TokenList.prototype.add = function add () {
      var this$1 = this;
      var tokens = [], len = arguments.length;
      while ( len-- ) tokens[ len ] = arguments[ len ];

    TokenList.explode(tokens).forEach(function (token) {
      if (token == null) { return; }
      if (this$1.contains(token)) { return; }
      this$1[this$1.length++] = token;
    });
    return this;
  };

  /**
   * @param {*} token
   * @return {boolean}
   */
  TokenList.prototype.contains = function contains (token) {
    return indexOf.call(this, token) > -1;
  };

  TokenList.prototype.item = function item (index) {
    if (index < 0) { index += this.length; }
    if (index >= this.length) { return null; }
    return index < 0 ? null : this[index];
  };

  /**
   * @param {*[]} tokens
   */
  TokenList.prototype.remove = function remove () {
      var this$1 = this;
      var tokens = [], len = arguments.length;
      while ( len-- ) tokens[ len ] = arguments[ len ];

    tokens.forEach(function (token) {
      var index = indexOf.call(this$1, token);
      if (index > -1) { splice.call(this$1, index, 1); }
    });
  };

  /**
   * 从 TokenList 字符串中移除符号字串（token），并返回 false。
   * 如果传入的符号字串（token）不存在，则将其添加进去，并返回 true
   *
   * @param {string} token
   * @return {boolean}
   */
  TokenList.prototype.toggle = function toggle (token) {
    var has = this.contains(token);
    this[has ? 'remove' : 'add'](token);
    return has;
  };

  /**
   * @return {string}
   */
  TokenList.prototype.toString = function toString () {
    return join.call(this, ' ');
  };

  var camelizeRE = /-(\w)/g;

  /**
   * Camelize a hyphen-delimited string.
   * @type {function(string=): string}
   */
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; });
  });

  /**
   * Capitalize a string.
   *
   * @type {function(string=): string}
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  var hyphenateRE = /\B([A-Z])/g;

  /**
   * Hyphenate a camelCase string.
   *
   * @type {function(string=): string}
   */
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase();
  });

  exports.inBrowser = inBrowser;
  exports.inWeex = inWeex;
  exports.weexPlatform = weexPlatform;
  exports.UA = UA;
  exports.isIE = isIE;
  exports.isIE9 = isIE9;
  exports.isEdge = isEdge;
  exports.isAndroid = isAndroid;
  exports.isIOS = isIOS;
  exports.isChrome = isChrome;
  exports.cached = cached;
  exports.isUndefined = isUndefined;
  exports.isDefined = isDefined;
  exports.isTrue = isTrue;
  exports.isFalse = isFalse;
  exports.isPrimitive = isPrimitive;
  exports.isObject = isObject;
  exports.toRawType = toRawType;
  exports.isPlainObject = isPlainObject;
  exports.isRegExp = isRegExp;
  exports.isValidArrayIndex = isValidArrayIndex;
  exports.toString = toString;
  exports.toNumber = toNumber;
  exports.isNative = isNative;
  exports.isPreactElement = isPreactElement;
  exports.makeMap = makeMap;
  exports.makeMapAccessor = makeMapAccessor;
  exports.withMacroTask = withMacroTask;
  exports.nextTick = nextTick;
  exports.noop = noop;
  exports.once = once;
  exports.without = without;
  exports.encodeHTML = encodeHTML;
  exports.parseSlots = parseSlots;
  exports.StyleMap = StyleMap;
  exports.TokenList = TokenList;
  exports.camelize = camelize;
  exports.capitalize = capitalize;
  exports.hyphenate = hyphenate;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
