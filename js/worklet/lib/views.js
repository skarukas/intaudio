function checkRange(i, min, max) {
    if (i >= max || i < min) {
        throw new RangeError(`Index '${i}' is not in range of the view.`);
    }
    return true;
}
function isIndexInRange(v, length) {
    const isNumber = typeof v != 'symbol' && Number.isInteger(+v);
    return isNumber && checkRange(+v, 0, length);
}
export class ArrayView {
    get proxy() {
        var _a;
        return (_a = this._proxy) !== null && _a !== void 0 ? _a : (this._proxy = new Proxy(this, {
            get(target, p, receiver) {
                if (isIndexInRange(p, this.length)) {
                    return target.get(+p);
                }
                else {
                    return Reflect.get(target, p, receiver);
                }
            },
            set(target, p, newValue, receiver) {
                if (isIndexInRange(p, this.length)) {
                    target.set(+p, newValue);
                    return true;
                }
                else {
                    return Reflect.set(target, p, newValue, receiver);
                }
            }
        }));
    }
    constructor(privateConstructor, get, set, length) {
        this.get = get;
        this.set = set;
        this.length = length;
        if (privateConstructor != ArrayView.PRIVATE_CONSTRUCTOR) {
            throw new Error("Instances must be constructed using one of the ArrayView.create*() methods.");
        }
    }
    flatMap(callback, thisArg) {
        return Array.prototype.flat.call(this.proxy, callback, thisArg);
    }
    flat(depth) {
        return Array.prototype.flat.call(this.proxy, depth);
    }
    toLocaleString(locales, options) {
        throw new Error("Method not implemented.");
    }
    pop() {
        if (this.length) {
            const v = this.get(this.length - 1);
            this.length -= 1;
            return v;
        }
    }
    push(...items) {
        throw new Error("Method not implemented.");
    }
    concat(...items) {
        return Array.prototype.concat.call(this.proxy, ...items);
    }
    join(separator) {
        return Array.prototype.join.call(this.proxy, separator);
    }
    reverse() {
        return ArrayView.createReversedView(this.proxy);
    }
    shift() {
        throw new Error("Method not implemented.");
    }
    slice(start, end) {
        return ArrayView.createSliceView(this.proxy, start, end);
    }
    sort(compareFn) {
        return Array.prototype.sort.call(this.proxy, compareFn);
    }
    splice(start, deleteCount, ...rest) {
        throw new Error("Method not implemented.");
    }
    unshift(...items) {
        throw new Error("Method not implemented.");
    }
    indexOf(searchElement, fromIndex) {
        return Array.prototype.indexOf.call(this.proxy, searchElement, fromIndex);
    }
    lastIndexOf(searchElement, fromIndex) {
        return Array.prototype.lastIndexOf.call(this.proxy, searchElement, fromIndex);
    }
    every(predicate, thisArg) {
        return Array.prototype.every.call(this.proxy, predicate, thisArg);
    }
    some(predicate, thisArg) {
        return Array.prototype.some.call(this.proxy, predicate, thisArg);
    }
    forEach(callbackfn, thisArg) {
        return Array.prototype.forEach.call(this.proxy, callbackfn, thisArg);
    }
    map(callbackfn, thisArg) {
        return Array.prototype.map.call(this.proxy, callbackfn, thisArg);
    }
    filter(predicate, thisArg) {
        return Array.prototype.filter.call(this.proxy, predicate, thisArg);
    }
    reduce(callbackfn, initialValue) {
        return Array.prototype.reduce.call(this.proxy, callbackfn, initialValue);
    }
    reduceRight(callbackfn, initialValue) {
        return Array.prototype.reduceRight.call(this.proxy, callbackfn, initialValue);
    }
    find(predicate, thisArg) {
        return Array.prototype.find.call(this.proxy, predicate, thisArg);
    }
    findIndex(predicate, thisArg) {
        return Array.prototype.findIndex.call(this.proxy, predicate, thisArg);
    }
    fill(value, start, end) {
        return Array.prototype.fill.call(this.proxy, value, start, end);
    }
    copyWithin(target, start, end) {
        return Array.prototype.copyWithin.call(this.proxy, target, start, end);
    }
    entries() {
        return Array.prototype.entries.call(this.proxy);
    }
    keys() {
        return Array.prototype.keys.call(this.proxy);
    }
    values() {
        return Array.prototype.values.call(this.proxy);
    }
    includes(searchElement, fromIndex) {
        return Array.prototype.includes.call(this.proxy, searchElement, fromIndex);
    }
    [Symbol.iterator]() {
        return Array.prototype[Symbol.iterator].call(this.proxy);
    }
    toString() {
        return `ArrayView (${this.length})`;
    }
    toArray() {
        return [...this];
    }
    static create(get, set, length) {
        const view = new ArrayView(ArrayView.PRIVATE_CONSTRUCTOR, get, set, length);
        return view.proxy;
    }
    static createFromDataLocationFn(getDataLocation, length) {
        return this.create(function get(i) {
            const data = getDataLocation(i);
            return data.array[data.index];
        }, function set(i, v) {
            const data = getDataLocation(i);
            data.array[data.index] = v;
        }, length);
    }
    static createConcatView(...arrays) {
        const lengths = arrays.map(a => a.length);
        const lengthSum = lengths.reduce((sum, c) => sum + c, 0);
        function getDataLocation(i) {
            for (let arrayIndex = 0; arrayIndex < arrays.length; arrayIndex++) {
                if (i < lengths[arrayIndex]) {
                    return {
                        array: arrays[arrayIndex],
                        index: i
                    };
                }
                else {
                    i -= lengths[arrayIndex];
                }
            }
            throw new RangeError(`Index '${i}' is not in range of the view.`);
        }
        return this.createFromDataLocationFn(getDataLocation, lengthSum);
    }
    static createSliceView(array, startIndex, endIndex) {
        // TODO: validate these numbers.
        startIndex !== null && startIndex !== void 0 ? startIndex : (startIndex = 0);
        endIndex !== null && endIndex !== void 0 ? endIndex : (endIndex = array.length);
        function getDataLocation(i) {
            const index = i + startIndex;
            return { array, index };
        }
        return this.createFromDataLocationFn(getDataLocation, endIndex - startIndex);
    }
    static createReindexedView(array, indices) {
        function getDataLocation(i) {
            return { array, index: indices[i] };
        }
        return this.createFromDataLocationFn(getDataLocation, indices.length);
    }
    static createInterleavedView(...arrays) {
        let singleArrLength = undefined;
        const numArrs = arrays.length;
        for (const arr of arrays) {
            singleArrLength !== null && singleArrLength !== void 0 ? singleArrLength : (singleArrLength = arr.length);
            if (arr.length != singleArrLength) {
                throw new Error(`Each array to interleave must be the same length. Expected ${singleArrLength}, got ${arr.length}`);
            }
        }
        function getDataLocation(i) {
            const index = Math.floor(i / numArrs);
            const arrIndex = i % numArrs;
            return { array: arrays[arrIndex], index };
        }
        return this.createFromDataLocationFn(getDataLocation, singleArrLength * numArrs);
    }
    static createDeinterleavedViews(array, numViews) {
        let length = array.length / numViews;
        if (!Number.isInteger(length)) {
            throw new Error(`The length of the array must be exactly divisible by numViews. Given numViews=${numViews}, array.length=${array.length}`);
        }
        const views = [];
        for (let viewIndex = 0; viewIndex < numViews; viewIndex++) {
            function getDataLocation(i) {
                return { array, index: i * numViews + viewIndex };
            }
            const view = this.createFromDataLocationFn(getDataLocation, length);
            views.push(view);
        }
        return views;
    }
    static createReversedView(array) {
        function getDataLocation(i) {
            return { array, index: array.length - (i + 1) };
        }
        return this.createFromDataLocationFn(getDataLocation, array.length);
    }
}
Symbol.unscopables;
ArrayView.PRIVATE_CONSTRUCTOR = Symbol('PRIVATE_CONSTRUCTOR');
