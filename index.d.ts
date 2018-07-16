declare namespace preactUtils {

  // cached
  // ==============================

  type CacheFunction<T = any> = (arg: string) => T;
  function cached<T>(fn: CacheFunction): CacheFunction;

  // is
  // ==============================

  function isUndefined(val: any): boolean;
  function isDefined(val: any): boolean;
  function isTrue(val: any): boolean;
  function isFalse(val: any): boolean;
  function isPrimitive(val: any): boolean;
  function isObject(val: any): boolean;
  function isPlainObject(val: any): boolean;
  function isRegExp(value: any): boolean;
  function isValidArrayIndex(val: any): boolean;
  function isNative(ctor: any): boolean;
  function isPreactElement(node: any): boolean;
  function toRawType(val: any): 'Function' | 'Object' | 'Array' | 'RegExp' | 'Number' | 'Symbol' | 'Undefined' | 'Null';
  function toString(val: any): string;
  function toNumber(val: any): number;

  // make-map
  // ==============================

  type AccessFunction = (val: string) => boolean;
  function makeMap(str: string, separator?: string | RegExp): Record<string, true>;
  function makeMapAccessor(str: string, expectsLowerCase?: boolean, separator?: string | RegExp): AccessFunction;

  // noop
  // ==============================

  function noop(a?: any, b?: any, c?: any, d?: any): void;

  // once
  // ==============================

  function once(fn: Function): typeof fn;

  // without
  // ==============================

  function without(obj: object, excludes: string[]): object;

  // html
  // =========================

  function encodeHTML(str: string): string;

  // slots
  // =========================

  function parseSlots<T>(children: T[]): Record<string, T[]>;

  // StyleMap
  // =========================

  class StyleMap {
    static from(data: any): StyleMap;
    static explode(data: any): Record<string, string | number>;
    static property(name: string): string;
    readonly size: number;
    append(name: string, value: string | number): this;
    get(name: string): string | number;
    has(name: string): boolean;
    remove(name: string): boolean;
    set(name: string, value: string | number): this;
    toString(): string;
  }

  // TokenList
  // =========================

  class TokenList {
    static from(data: any): TokenList;
    static explode(data: any): string[];
    readonly length: number;
    add(...tokens: any[]): this;
    contains(token: string): boolean;
    item(index: number): string | null;
    remove(...tokens: string[]): void;
    toggle(token: string): boolean;
    toString(): string;
  }

  // string
  // =========================

  function camelize(str: string): string;
  function capitalize(str: string): string;
  function hyphenate(str: string): string;

  // env
  // =========================
  const inBrowser: boolean;
  const inWeex: boolean;
  const weexPlatform: string;
  const UA: string;
  const isIE: boolean;
  const isIE9: boolean;
  const isEdge: boolean;
  const isAndroid: boolean;
  const isIOS: boolean;
  const isChrome: boolean;
}

export = preactUtils;
