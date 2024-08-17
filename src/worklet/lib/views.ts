export interface WritableArrayLike<T> {
  readonly length: number;
  [n: number]: T;
  [Symbol.iterator](): Iterator<T>;
}

function checkRange(i: number, min: number, max: number) {
  if (i >= max || i < min) {
    throw new RangeError(`Index '${i}' is not in range of the view.`)
  }
  return true
}

function isIndexInRange(v: string | symbol, length: number) {
  const isNumber = typeof v != 'symbol' && Number.isInteger(+v)
  return isNumber && checkRange(+v, 0, length)
}

export class ArrayView<T> implements WritableArrayLike<T>, Array<T> {
  protected static PRIVATE_CONSTRUCTOR = Symbol('PRIVATE_CONSTRUCTOR');
  [n: number]: T;  // This is implemented by the Proxy.
  private _proxy: this | undefined
  protected get proxy(): this {
    const length = this.length
    return this._proxy ?? (this._proxy = new Proxy(this, {
      get(target, p, receiver) {
        if (isIndexInRange(p, length)) {
          return target.get(+<any>p)
        } else {
          return Reflect.get(target, p, receiver)
        }
      },
      set(target, p, newValue, receiver) {
        if (isIndexInRange(p, length)) {
          target.set(+<any>p, newValue)
          return true
        } else {
          return Reflect.set(target, p, newValue, receiver)
        }
      }
    }))
  }
  protected constructor(
    privateConstructor: Symbol,
    protected get: (i: number) => T,
    protected set: (i: number, v: T) => void,
    public length: number,
  ) {
    if (privateConstructor != ArrayView.PRIVATE_CONSTRUCTOR) {
      throw new Error("Instances must be constructed using one of the ArrayView.create*() methods.")
    }
  }
  flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>, thisArg?: This): U[] {
    return <U[]>Array.prototype.flatMap.call(this.proxy, <any>callback, thisArg)
  }
  flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[] {
    return <FlatArray<A, D>[]>Array.prototype.flat.call((<any>this).proxy, depth)
  }
  toLocaleString(): string;
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
  toLocaleString(locales?: unknown, options?: unknown): string {
    throw new Error("Method not implemented.");
  }
  pop(): T | undefined {
    if (this.length) {
      const v = this.get(this.length - 1)
      this.length -= 1
      return v
    }
  }
  push(...items: T[]): number {
    throw new Error("Method not implemented.");
  }
  concat(...items: ConcatArray<T>[]): T[];
  concat(...items: (T | ConcatArray<T>)[]): T[];
  concat(...items: unknown[]): T[] {
    return Array.prototype.concat.call(this.proxy, ...items)
  }
  join(separator?: string): string {
    return Array.prototype.join.call(this.proxy, separator)
  }
  reverse(): T[] {
    return ArrayView.createReversedView(this.proxy)
  }
  shift(): T | undefined {
    throw new Error("Method not implemented.");
  }
  slice(start?: number, end?: number): T[] {
    return ArrayView.createSliceView(this.proxy, start, end)
  }
  sort(compareFn?: (a: T, b: T) => number): this {
    return <this>Array.prototype.sort.call(this.proxy, compareFn)
  }
  splice(start: number, deleteCount?: number): T[];
  splice(start: number, deleteCount: number, ...items: T[]): T[];
  splice(start: unknown, deleteCount?: unknown, ...rest: unknown[]): T[] {
    throw new Error("Method not implemented.");
  }
  unshift(...items: T[]): number {
    throw new Error("Method not implemented.");
  }
  indexOf(searchElement: T, fromIndex?: number): number {
    return Array.prototype.indexOf.call(this.proxy, searchElement, fromIndex)
  }
  lastIndexOf(searchElement: T, fromIndex?: number): number {
    return Array.prototype.lastIndexOf.call(this.proxy, searchElement, fromIndex)
  }
  every<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): this is S[];
  every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;
  every(predicate: any, thisArg?: unknown): boolean {
    return Array.prototype.every.call(this.proxy, predicate, thisArg)
  }
  some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean {
    return Array.prototype.some.call(this.proxy, predicate, thisArg)
  }
  forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
    return Array.prototype.forEach.call(this.proxy, callbackfn, thisArg)
  }
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
    return <U[]>Array.prototype.map.call(this.proxy, callbackfn, thisArg)
  }
  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
  filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
  filter(predicate: any, thisArg?: unknown): T[] {
    return Array.prototype.filter.call(this.proxy, predicate, thisArg)
  }
  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
  reduce(callbackfn: any, initialValue?: unknown): T | any {
    return Array.prototype.reduce.call(this.proxy, callbackfn, initialValue)
  }
  reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
  reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
  reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
  reduceRight(callbackfn: any, initialValue?: any): T | any {
    return Array.prototype.reduceRight.call(this.proxy, callbackfn, initialValue)
  }
  find<S extends T>(predicate: (value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
  find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
  find(predicate: any, thisArg?: unknown): T {
    return Array.prototype.find.call(this.proxy, predicate, thisArg)
  }
  findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number {
    return Array.prototype.findIndex.call(this.proxy, predicate, thisArg)
  }
  fill(value: T, start?: number, end?: number): this {
    return <this>Array.prototype.fill.call(this.proxy, value, start, end)
  }
  copyWithin(target: number, start: number, end?: number): this {
    return <this>Array.prototype.copyWithin.call(this.proxy, target, start, end)
  }
  entries(): IterableIterator<[number, T]> {
    return Array.prototype.entries.call(this.proxy)
  }
  keys(): IterableIterator<number> {
    return Array.prototype.keys.call(this.proxy)
  }
  values(): IterableIterator<T> {
    return Array.prototype.values.call(this.proxy)
  }
  includes(searchElement: T, fromIndex?: number): boolean {
    return Array.prototype.includes.call(this.proxy, searchElement, fromIndex)
  }
  [Symbol.iterator](): IterableIterator<T> {
    return Array.prototype[Symbol.iterator].call(this.proxy)
  }
  [Symbol.unscopables]: any;
  toString() {
    return `ArrayView (${this.length})`
  }
  toArray(): T[] {
    return [...this]
  }
  static create<T>(
    get: (i: number) => T,
    set: (i: number, v: T) => void,
    length: number
  ): ArrayView<T> {
    const view = new ArrayView(ArrayView.PRIVATE_CONSTRUCTOR, get, set, length)
    return view.proxy
  }
  protected static createFromDataLocationFn<T>(
    getDataLocation: (i: number) => { array: WritableArrayLike<T>, index: number },
    length: number
  ): ArrayView<T> {
    return this.create(
      function get(i: number): T {
        const data = getDataLocation(i)
        return data.array[data.index]
      },
      function set(i: number, v: T) {
        const data = getDataLocation(i)
        data.array[data.index] = v
      },
      length
    )
  }
  static createConcatView<T>(...arrays: WritableArrayLike<T>[]): ArrayView<T> {
    const lengths = arrays.map(a => a.length)
    const lengthSum = lengths.reduce((sum, c) => sum + c, 0)

    function getDataLocation(
      i: number
    ): { array: WritableArrayLike<T>, index: number } {
      for (let arrayIndex = 0; arrayIndex < arrays.length; arrayIndex++) {
        if (i < lengths[arrayIndex]) {
          return {
            array: arrays[arrayIndex],
            index: i
          }
        } else {
          i -= lengths[arrayIndex]
        }
      }
      throw new RangeError(`Index '${i}' is not in range of the view.`)
    }
    return this.createFromDataLocationFn(getDataLocation, lengthSum)
  }
  static createSliceView<T>(
    array: WritableArrayLike<T>,
    startIndex?: number,
    endIndex?: number
  ): ArrayView<T> {
    // TODO: validate these numbers.
    startIndex ??= 0
    endIndex ??= array.length
    function getDataLocation(i: number) {
      const index = i + <number>startIndex
      return { array, index }
    }
    return this.createFromDataLocationFn(getDataLocation, endIndex - startIndex)
  }
  static createReindexedView<T>(
    array: WritableArrayLike<T>,
    indices: number[]
  ): ArrayView<T> {
    function getDataLocation(i: number) {
      return { array, index: indices[i] }
    }
    return this.createFromDataLocationFn(getDataLocation, indices.length)
  }
  static createInterleavedView<T>(...arrays: WritableArrayLike<T>[]): ArrayView<T> {
    let singleArrLength = undefined
    const numArrs = arrays.length
    for (const arr of arrays) {
      singleArrLength ??= arr.length
      if (arr.length != singleArrLength) {
        throw new Error(`Each array to interleave must be the same length. Expected ${singleArrLength}, got ${arr.length}`)
      }
    }
    function getDataLocation(i: number) {
      const index = Math.floor(i / numArrs)
      const arrIndex = i % numArrs
      return { array: arrays[arrIndex], index }
    }
    return this.createFromDataLocationFn(
      getDataLocation,
      <number>singleArrLength * numArrs
    )
  }
  static createDeinterleavedViews<T>(
    array: WritableArrayLike<T>,
    numViews: number
  ): ArrayView<T>[] {
    let length = array.length / numViews
    if (!Number.isInteger(length)) {
      throw new Error(`The length of the array must be exactly divisible by numViews. Given numViews=${numViews}, array.length=${array.length}`)
    }
    const views = []
    for (let viewIndex = 0; viewIndex < numViews; viewIndex++) {
      function getDataLocation(i: number) {
        return { array, index: i * numViews + viewIndex }
      }
      const view = this.createFromDataLocationFn(getDataLocation, length)
      views.push(view)
    }
    return views
  }
  static createReversedView<T>(array: WritableArrayLike<T>): ArrayView<T> {
    function getDataLocation(i: number) {
      return { array, index: array.length - (i + 1) }
    }
    return this.createFromDataLocationFn(getDataLocation, array.length)
  }
}
