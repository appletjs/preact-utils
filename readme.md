# Preact Utils

[![version](https://img.shields.io/npm/v/preact-utils.svg?style=flat-square)](https://www.npmjs.com/package/preact-utils)
[![downloads](https://img.shields.io/npm/dt/preact-utils.svg?style=flat-square)](https://www.npmjs.com/package/preact-utils)

简单实用的工具

## env

Browser environment sniffing.

- {boolean} inBrowser
- {boolean} inWeex
- {string} weexPlatform
- {string} UA
- {boolean} isIE
- {boolean} isIE9
- {boolean} isEdge
- {boolean} isAndroid
- {boolean} isIOS
- {boolean} isChrome

## is

- isUndefined(v: any): boolean;
- isDefined(v: any): boolean;
- isTrue(v: any): boolean;
- isFalse(v: any): boolean;
- isPrimitive(v: any): boolean;
- isObject(v: any): boolean;
- isPlainObject(v: any): boolean;
- isRegExp(v: any): boolean;
- isValidArrayIndex(v: any): boolean;
- toRawType(v: any): string;
- toString(v: any): string;
- toNumber(v: any): number | string;

## functions

- makeMap(str: string, separator: string | RegExp): Object
- makeMapAccessor(str: string, expectsLowerCase: boolean, separator: string | RegExp): (function(key=string): boolean | undefined);
- cached(fn: (function(string=): any)): function(string=): any
- withMacroTask(fn: Function): Function;
- nextTick(cb: Function, ctx: object): Promise<any> | undefined;
- once(fn: Function): any;
- without(obj: Object, exclude: string[]): Object
- noop(): undefined;

## string

- camelize(str: string): string;
- capitalize(str: string): string;
- hyphenate(str: string): string;

## StyleMap

> **自动识别浏览器前缀**。

#### 静态方法

- from(data: string | Object): StyleMap;
- explode(data: string | Object): Object;

#### 实例属性

- {number} size

#### 实例方法

- constructor(style: string | Object);
- append(name: string, value: any): this;
- get(name: string): any;
- has(name: string): boolean;
- remove(name: string): boolean;
- set(name: string, value: string): this;
- toString(): string;

## TokenList

> 模拟 DOMTokenList 接口，主要用于组件的 class 管理，类似于 Vue 的绑定 class 方式。

#### 静态方法

- from(data: string | any[] | Object): TokenList
- explode(data: string | any[] | object): string[];

#### 实例属性

- {number} length 

#### 实例方法

- constructor(data: string | any[] | Object);
- add(...tokens: any[]): this;
- contains(token: string): boolean;
- item(index: number): string | null;
- remove(...tokens: string[]): this;
- toggle(token: string): boolean;
- toString(): string;


## slot

- parseSlots(children: any[]): Record<string, any[]>;

```jsx harmony

<Container>
  {/* slot: foo */}
  <Card slot="foo">...</Card>
  {/* slot: bar */}
  <Card slot="bar">...</Card>
  {/* slot: default */}
  <span>html element</span>
  <Card>component</Card>
</Container>;

```


## Todo List

- [ ] 添加测试用例
- [ ] 编写开发文档


## License

MIT © 2018, <a href="mailto:japplet@163.com" title="japplet@163.com">Maofeng Zhang</a>