class Disconnect extends Error {
}
/**
 * A special Error object that, when thrown within a FunctionComponent, will cause the component to disconnect, but not log the error.
 */
const disconnect = () => { throw new Disconnect("DISCONNECT"); };
var WaveType;
(function (WaveType) {
    WaveType["SINE"] = "sine";
    WaveType["SQUARE"] = "square";
    WaveType["SAWTOOTH"] = "sawtooth";
    WaveType["TRIANGLE"] = "triangle";
    WaveType["CUSTOM"] = "custom";
    // TODO: add more
})(WaveType || (WaveType = {}));
var RangeType;
(function (RangeType) {
    RangeType["SLIDER"] = "slider";
    RangeType["KNOB"] = "knob";
})(RangeType || (RangeType = {}));
var TimeMeasure;
(function (TimeMeasure) {
    TimeMeasure["CYCLES"] = "cycles";
    TimeMeasure["SECONDS"] = "seconds";
    TimeMeasure["SAMPLES"] = "samples";
})(TimeMeasure || (TimeMeasure = {}));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function CallableInstance(property) {
  var func = this.constructor.prototype[property];
  var apply = function() { return func.apply(apply, arguments); };
  Object.setPrototypeOf(apply, this.constructor.prototype);
  Object.getOwnPropertyNames(func).forEach(function (p) {
    Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p));
  });
  return apply;
}
CallableInstance.prototype = Object.create(Function.prototype);

var callableInstance = CallableInstance;

var CallableInstance$1 = /*@__PURE__*/getDefaultExportFromCjs(callableInstance);

class TypedConfigurable extends CallableInstance$1 {
    constructor() {
        super("__call__");
        Object.defineProperty(this, 'name', {
            value: this.constructor.name,
            writable: true,
            configurable: true
        });
        Object.defineProperty(this, 'length', {
            value: this.constructor.length,
            writable: true,
            configurable: true
        });
    }
    __call__(__forbiddenCall) {
        throw new Error(`Object of type ${this.constructor.name} is not a function.`);
    }
}

var constants = Object.freeze({
    MUTED_CLASS: "component-muted",
    BYPASSED_CLASS: "component-bypassed",
    COMPONENT_CONTAINER_CLASS: "modular-container",
    KEYBOARD_KEY_CLASS: "keyboard-key",
    KEYBOARD_KEY_PRESSED_CLASS: "keyboard-key-pressed",
    BYPASS_INDICATOR_CLASS: "bypass-indicator",
    MONITOR_VALUE_CLASS: "monitor-value",
    MONITOR_OUT_OF_BOUNDS_CLASS: "monitor-out-of-bounds",
    UNINITIALIZED_CLASS: "component-uninitialized",
    BANG_CLASS: "bang",
    BANG_PRESSED_CLASS: "bang-pressed",
    MIDI_LEARN_LISTENING_CLASS: "midi-learn-listening",
    MIDI_LEARN_ASSIGNED_CLASS: "midi-learn-assigned",
    EVENT_AUDIOPROCESS: "audioprocess",
    EVENT_MOUSEDOWN: "mousedown",
    EVENT_MOUSEUP: "mouseup",
    TRIGGER: Symbol("trigger"),
    MIN_PLAYBACK_RATE: 0.0625,
    MAX_PLAYBACK_RATE: 16.0,
    MAX_CHANNELS: 32,
    DEFAULT_NUM_CHANNELS: 2,
    MAX_ANALYZER_LENGTH: 32768,
    // Special placeholder for when an input both has no defaultValue and it has 
    // never been set.
    // TODO: need special value?
    UNSET_VALUE: undefined
});

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function tryWithFailureMessage(fn, message) {
    try {
        return fn();
    }
    catch (e) {
        e.message = `${message}\nOriginal error: [${e.message}]`;
        throw e;
    }
}
function isPlainObject(value) {
    return (value === null || value === void 0 ? void 0 : value.constructor) === Object;
}
function createScriptProcessorNode(context, windowSize, numInputChannels, numOutputChannels) {
    const processor = context.createScriptProcessor(windowSize, numInputChannels, numOutputChannels);
    // Store true values because the constructor settings are not persisted on 
    // the WebAudio object.
    // @ts-ignore Property undefined.
    processor['__numInputChannels'] = numInputChannels;
    // @ts-ignore Property undefined.
    processor['__numOutputChannels'] = numOutputChannels;
    return processor;
}
function range(n) {
    return Array(n).fill(0).map((v, i) => i);
}
function* enumerate(arr) {
    let i = 0;
    for (const x of arr) {
        yield [i++, x];
    }
}
function* zip(...iterables) {
    const iterators = iterables.map(iterable => iterable[Symbol.iterator]());
    let done = false;
    while (!done) {
        const current = iterators.map(iterator => iterator.next());
        done = current.some(result => result.done);
        if (!done) {
            yield current.map(result => result.value);
        }
    }
}
function arrayToObject(arr) {
    const res = {};
    for (const [i, v] of enumerate(arr)) {
        res[i] = v;
    }
    return res;
}
function createConstantSource(audioContext) {
    let src = audioContext.createConstantSource();
    src.offset.setValueAtTime(0, audioContext.currentTime);
    src.start();
    return src;
}
function isComponent(x) {
    return !!(x === null || x === void 0 ? void 0 : x.isComponent);
}
function isFunction(x) {
    return x instanceof Function && !(x instanceof TypedConfigurable);
}
function mapLikeToObject(map) {
    const obj = {};
    map.forEach((v, k) => obj[k] = v);
    return obj;
}
/**
 * Scale a value to a new range.
 *
 * @param v The value to scale, where `inMin <= v <= inMax`.
 * @param inputRange An array `[inMin, inMax]` specifying the range the input comes from.
 * @param outputRange An array `[outMin, outMax]` specifying the desired range  of the output.
 * @returns A scaled value `x: outMin <= x <= outMax`.
 */
function scaleRange(v, [inMin, inMax], [outMin, outMax]) {
    const zeroOneScaled = (v - inMin) / (inMax - inMin);
    return zeroOneScaled * (outMax - outMin) + outMin;
}
function afterRender(fn) {
    setTimeout(fn, 100);
}
const primitiveClasses = [Number, Boolean, String, Symbol, BigInt];
function isAlwaysAllowedDatatype(value) {
    return value == constants.TRIGGER || value == undefined;
}
function wrapValidator(fn) {
    return function (v) {
        if (!isAlwaysAllowedDatatype(v) && fn(v) === false) {
            throw new Error(`The value ${v} failed validation.`);
        }
    };
}
function isType(x, types) {
    types = types instanceof Array ? types : [types];
    let res = false;
    for (let type of types) {
        if (primitiveClasses.includes(type)) {
            type = type.name.toLowerCase();
        }
        if (typeof type === 'string') {
            res || (res = typeof x == type);
        }
        else {
            res || (res = x instanceof type);
        }
    }
    return res;
}
function createTypeValidator(type) {
    return function (value) {
        if (!isType(value, type)) {
            throw new Error(`Expected value to be typeof / instanceof '${type}', but found type '${typeof value}' instead. Value: ${value}`);
        }
    };
}
function defineTimeRamp(audioContext, timeMeasure, node = undefined, mapFn = v => v, durationSec = 1e8) {
    // Continuous ramp representing the AudioContext time.
    let multiplier;
    if (timeMeasure == TimeMeasure.CYCLES) {
        multiplier = 2 * Math.PI;
    }
    else if (timeMeasure == TimeMeasure.SECONDS) {
        multiplier = 1;
    }
    else if (timeMeasure == TimeMeasure.SAMPLES) {
        multiplier = audioContext.sampleRate;
    }
    const toValue = (v) => mapFn(v * multiplier);
    let timeRamp = node !== null && node !== void 0 ? node : createConstantSource(audioContext);
    let currTime = audioContext.currentTime;
    const endTime = currTime + durationSec;
    timeRamp.offset.cancelScheduledValues(currTime);
    timeRamp.offset.setValueAtTime(toValue(0), currTime);
    timeRamp.offset.linearRampToValueAtTime(toValue(durationSec), endTime);
    return timeRamp;
}
// TODO: figure out how to avoid circular dependency??
/*
export function createComponent(webAudioNode: WebAudioConnectable): AudioComponent;
export function createComponent(fn: Function): FunctionComponent;
export function createComponent(x: any): Component {
  if (x instanceof AudioNode || x instanceof AudioParam) {
    return new AudioComponent(x)
  } else if (x instanceof Function) {
    return new FunctionComponent(x)
  }
  return undefined
}
 */
function loadFile(audioContext, filePathOrUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(filePathOrUrl);
        const arrayBuffer = yield response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    });
}
const registryIdPropname = "__registryId__";
function getBufferId(buffer) {
    // @ts-ignore Property undefined.
    if (!buffer[registryIdPropname]) {
        // @ts-ignore Property undefined.
        buffer[registryIdPropname] = crypto.randomUUID();
    }
    // @ts-ignore Property undefined.
    return buffer[registryIdPropname];
}
function bufferToFloat32Arrays(buffer) {
    const arrs = [];
    for (let c = 0; c < buffer.numberOfChannels; c++) {
        arrs.push(buffer.getChannelData(c));
    }
    return arrs;
}
// These functions are unused as SharedArrayBuffer has is restricted to serving
// the page with certain headers. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
// TODO: consider revisitng using SharedArrayBuffer to share the buffer between 
// threads instead of copying.
/* Turns the underlying data into a shared buffer, if it is not already. */
function makeBufferShared(arr) {
    if (arr.buffer instanceof SharedArrayBuffer) {
        return arr;
    }
    const sharedBuffer = new SharedArrayBuffer(arr.buffer.byteLength);
    const sharedArray = new Float32Array(sharedBuffer);
    sharedArray.set(arr);
    return sharedArray;
}
function makeAudioBufferShared(buffer) {
    for (let c = 0; c < buffer.numberOfChannels; c++) {
        const original = buffer.getChannelData(c);
        buffer.copyToChannel(makeBufferShared(original), c);
    }
}

var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    afterRender: afterRender,
    arrayToObject: arrayToObject,
    bufferToFloat32Arrays: bufferToFloat32Arrays,
    createConstantSource: createConstantSource,
    createScriptProcessorNode: createScriptProcessorNode,
    createTypeValidator: createTypeValidator,
    defineTimeRamp: defineTimeRamp,
    enumerate: enumerate,
    getBufferId: getBufferId,
    isAlwaysAllowedDatatype: isAlwaysAllowedDatatype,
    isComponent: isComponent,
    isFunction: isFunction,
    isPlainObject: isPlainObject,
    isType: isType,
    loadFile: loadFile,
    makeAudioBufferShared: makeAudioBufferShared,
    makeBufferShared: makeBufferShared,
    mapLikeToObject: mapLikeToObject,
    range: range,
    scaleRange: scaleRange,
    tryWithFailureMessage: tryWithFailureMessage,
    wrapValidator: wrapValidator,
    zip: zip
});

function toMultiChannelArray(array) {
    const proxy = new Proxy(array, {
        get(target, p, receiver) {
            if (p == "left")
                return target[0];
            if (p == "right")
                return target[1];
            return Reflect.get(target, p, receiver);
        }
    });
    return proxy;
}

const IS_WORKLET = typeof AudioWorkletProcessor != 'undefined';
function getColumn(arr, col) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(arr[i][col]);
    }
    return result;
}
function writeColumn(arr, col, values) {
    for (let i = 0; i < arr.length; i++) {
        arr[i][col] = values[i];
    }
}
function assertValidReturnType(result) {
    if (result === undefined) {
        throw new Error("Expected mapping function to return valid value(s), but got undefined.");
    }
}
function processSamples(fn, inputChunks, outputChunks, contextFactory) {
    var _a, _b;
    const numChannels = (_a = inputChunks[0]) === null || _a === void 0 ? void 0 : _a.length;
    const numSamples = (_b = inputChunks[0][0]) === null || _b === void 0 ? void 0 : _b.length;
    for (let c = 0; c < numChannels; c++) {
        for (let i = 0; i < numSamples; i++) {
            const inputs = inputChunks.map(input => input[c][i]);
            const context = contextFactory.getContext({ channelIndex: c, sampleIndex: i });
            const outputs = context.execute(fn, inputs);
            for (const [output, dest] of zip(outputs, outputChunks)) {
                assertValidReturnType(output);
                dest[c][i] = output;
            }
        }
    }
    // The number of output channels is the same as the input because this is not
    // determined by the user's function.
    return outputChunks.map(_ => numChannels);
}
function processTime(fn, inputChunks, outputChunks, contextFactory) {
    var _a;
    const numChannels = (_a = inputChunks[0]) === null || _a === void 0 ? void 0 : _a.length;
    for (let c = 0; c < numChannels; c++) {
        const inputs = inputChunks.map(input => input[c]);
        const context = contextFactory.getContext({ channelIndex: c });
        const outputs = context.execute(fn, inputs);
        for (const [output, dest] of zip(outputs, outputChunks)) {
            assertValidReturnType(output);
            dest[c].set(output);
        }
    }
    // The number of output channels is the same as the input because this is not
    // determined by the user's function.
    return outputChunks.map(_ => numChannels);
}
/**
 * Apply a fuction across the audio chunk (channels and time).
 *
 * @param fn
 * @param inputChunks
 * @param outputChunks
 * @returns The number of channels for each output of the function.
 */
function processTimeAndChannels(fn, inputChunks, outputChunks, contextFactory) {
    const inputs = inputChunks.map(toMultiChannelArray);
    const context = contextFactory.getContext();
    const outputs = context.execute(fn, inputs);
    assertValidReturnType(outputs);
    for (const [output, dest] of zip(outputs, outputChunks)) {
        for (let c = 0; c < output.length; c++) {
            if (output[c] == undefined) {
                continue; // This signifies that the channel should be empty.
            }
            dest[c].set(output[c]);
        }
    }
    return outputs.map(a => a.length);
}
/**
 * Apply a fuction to each sample, across channels.
 *
 * @param fn
 * @param inputChunks
 * @param outputChunks
 * @returns The number of channels for each output of the function.
 */
function processChannels(fn, inputChunks, outputChunks, contextFactory) {
    var _a;
    const numOutputChannels = Array(outputChunks.length).fill(0);
    const numSamples = (_a = inputChunks[0][0]) === null || _a === void 0 ? void 0 : _a.length;
    for (let i = 0; i < numSamples; i++) {
        // Get the i'th sample, across all channels and inputs.
        const inputs = inputChunks.map(input => {
            const inputChannels = getColumn(input, i);
            return toMultiChannelArray(inputChannels);
        });
        const context = contextFactory.getContext({ sampleIndex: i });
        const outputChannels = context.execute(fn, inputs);
        for (const [j, [output, destChunk]] of enumerate(zip(outputChannels, outputChunks))) {
            // TODO: add NaN logic to postprocessing instead.
            writeColumn(destChunk, i, map(output, v => isFinite(v) ? v : 0));
            numOutputChannels[j] = output.length;
        }
    }
    return numOutputChannels;
}
function getProcessingFunction(dimension) {
    switch (dimension) {
        case "all":
            return processTimeAndChannels;
        case "channels":
            return processChannels;
        case "time":
            return processTime;
        case "none":
            return processSamples;
        default:
            throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`);
    }
}
function mapOverChannels(dimension, data, fn) {
    switch (dimension) {
        case "all":
            return map(data, fn);
        case "channels":
            const channels = data;
            return map(channels, c => fn([c]));
        case "time":
            return fn(data);
        case "none":
            return fn([data]);
        default:
            throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`);
    }
}
// Lightweight check that the structure is correct.
function isCorrectOutput(dimension, output, type) {
    const typeValidation = type.__NEW__validateAny(output);
    switch (dimension) {
        case "all":
            return typeValidation && isArrayLike(output) && isArrayLike(output[0]);
        case "channels":
            // NOTE: Channels can be undefined, a special case that means empty data.
            return output == undefined || typeValidation && isArrayLike(output);
        case "time":
            return typeValidation && isArrayLike(output);
        case "none":
            return typeValidation;
        default:
            throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`);
    }
}
function propertyIsDefined(obj, property) {
    return typeof obj === 'object'
        && obj !== null
        && property in obj
        && obj[property] != undefined;
}
function isArrayLike(value) {
    return isType(value, Array) || propertyIsDefined(value, 'length') && propertyIsDefined(value, 0);
}
/**
 * Returns a structure filled with zeroes that represents the shape of a single input or the output.
 */
function generateZeroInput(dimension, windowSize, numChannels) {
    switch (dimension) {
        case "all":
            const frame = [];
            for (let i = 0; i < numChannels; i++) {
                frame.push(new Float32Array(windowSize));
            }
            return toMultiChannelArray(frame);
        case "channels":
            const channels = Array(windowSize).fill(0);
            return toMultiChannelArray(channels);
        case "time":
            return new Float32Array(windowSize);
        case "none":
            return 0;
        default:
            throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`);
    }
}
function sum(iter) {
    let sm = 0;
    for (const x of iter) {
        sm += x;
    }
    return sm;
}
const _NO_VALUE = Symbol("_NO_VALUE");
function allEqual(iter) {
    let lastValue = _NO_VALUE;
    for (const x of iter) {
        if (lastValue != _NO_VALUE && lastValue != x) {
            return false;
        }
        lastValue = x;
    }
    return true;
}
function map(obj, fn) {
    if (isArrayLike(obj)) {
        return Array.prototype.map.call(obj, fn);
    }
    else {
        const res = {};
        Object.entries(obj).forEach(([key, value]) => {
            const result = fn(value, key);
            result != undefined && (res[key] = result);
        });
        return res;
    }
}
IS_WORKLET ? AudioWorkletProcessor : class AudioWorkletProcessor {
    constructor() {
        const channel = new MessageChannel();
        this.port = channel.port1;
        this.outPort = channel.port2;
    }
};

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
class ArrayView {
    get proxy() {
        var _a;
        const length = this.length;
        return (_a = this._proxy) !== null && _a !== void 0 ? _a : (this._proxy = new Proxy(this, {
            get(target, p, receiver) {
                if (isIndexInRange(p, length)) {
                    return target.get(+p);
                }
                else {
                    return Reflect.get(target, p, receiver);
                }
            },
            set(target, p, newValue, receiver) {
                if (isIndexInRange(p, length)) {
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
        return Array.prototype.flatMap.call(this.proxy, callback, thisArg);
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
ArrayView.PRIVATE_CONSTRUCTOR = Symbol('PRIVATE_CONSTRUCTOR');

// NOTE: IODatatypes always process one channel at a time.
class IODatatype {
    constructor() {
        this.name = this.constructor.name;
    }
    toString() {
        return `${this.name} (${this.dataspecString})`;
    }
    static create(dtype, name) {
        switch (dtype.toLowerCase()) {
            case "fft":
            case "stft":
                return new stft();
            case "audio":
                return new audio();
            case "control":
                return new control(name);
            default:
                throw new Error(`Unrecognized dtype ${dtype}. Supported datatypes: ['stft', 'audio', 'control']`);
        }
    }
}
class stft extends IODatatype {
    constructor(windowSize) {
        super();
        this.windowSize = windowSize;
        this.dataspecString = '{ magnitude: ArrayLike<number>, phase: ArrayLike<number> }';
        this.numAudioStreams = 3;
    }
    channelFromAudioData(frame) {
        if (!isType(frame.audioStreams[0], Array)) {
            throw new Error("STFT data must be arrays.");
        }
        // NOTE: Ignore the first audio stream (sync).
        return {
            magnitude: frame.audioStreams[1],
            phase: frame.audioStreams[2]
            // Other FFT traits to give the user?
        };
    }
    __NEW__validateAny(value) {
        return value.magnitude != undefined && value.phase != undefined;
    }
    __NEW__toAudioData(value, sampleIndex) {
        const sync = sampleIndex == undefined ?
            range(value.magnitude.length)
            : sampleIndex;
        return {
            audioStreams: [
                sync,
                value.magnitude,
                value.phase
            ]
        };
    }
    __OLD__validate(value, { checkLength }) {
        if (value == undefined) {
            throw new Error("Expected STFT data, got undefined.");
        }
        if (value.magnitude == undefined || value.phase == undefined) {
            throw new Error("STFT data must have keys magnitude and phase. Given: " + value);
        }
        for (let key of ["magnitude", "phase"]) {
            const arr = value[key];
            if (!isArrayLike(value)) {
                throw new Error(`Each STFT value must be an ArrayLike collection of numbers. Given ${key} value with no length property or numeric values.`);
            }
            if (checkLength && arr.length != this.windowSize) {
                throw new Error(`Returned size must be equal to the input FFT windowSize. Expected ${this.windowSize}, given ${key}.length=${arr.length}.`);
            }
        }
    }
    __OLD__channelToAudioData(value) {
        return {
            audioStreams: [
                range(value.magnitude.length), // sync signal.
                value.magnitude,
                value.phase
            ].map(toMultiChannelArray)
        };
    }
}
class audio extends IODatatype {
    constructor() {
        super(...arguments);
        this.dataspecString = 'ArrayLike<number>';
        this.numAudioStreams = 1;
    }
    __NEW__validateAny(value) {
        return isType(value, Number) || isArrayLike(value);
    }
    __NEW__toAudioData(value, sampleIndex) {
        throw new Error("Method not implemented.");
    }
    __OLD__validate(channel) {
        if (!isArrayLike(channel)) {
            throw new Error(`Each audio channel must be an ArrayLike collection of numbers. Given value with no length property or numeric values.`);
        }
        if (channel[0] != undefined && !isType(channel[0], Number)) {
            throw new Error(`Audio data must be numbers, given ${channel} (typeof ${typeof channel})`);
        }
    }
    channelFromAudioData(frame) {
        return frame.audioStreams[0];
    }
    __OLD__channelToAudioData(channel) {
        if (!(channel instanceof Array)) {
            throw new Error(`Audio data must be an array, given type ${typeof channel}.`);
        }
        channel = channel.map(v => isFinite(+v) ? v : 0);
        return {
            audioStreams: [toMultiChannelArray(channel)]
        };
    }
}
class control extends IODatatype {
    __NEW__validateAny(value) {
        throw new Error("control is not a valid return type.");
    }
    __NEW__toAudioData(value, sampleIndex) {
        throw new Error("control is not a valid return type.");
    }
    __OLD__validate(value) {
        throw new Error("control is not a valid return type.");
    }
    constructor(parameterKey) {
        super();
        this.parameterKey = parameterKey;
        this.dataspecString = 'any';
        this.numAudioStreams = 0;
    }
    channelFromAudioData(frame) {
        if (frame.parameters == undefined) {
            throw new Error(`undefined parameters, expected key ${this.parameterKey}`);
        }
        return frame.parameters[this.parameterKey];
    }
    __OLD__channelToAudioData(value) {
        // TODO: how would someone specify the output name?
        return {
            audioStreams: [],
            parameters: { [this.parameterKey]: value }
        };
    }
}
// TODO: use named outputs.
/**
 * Converts a frame of audio data + metadata to and from function I/O types exposed to the user-defined function. The frame may be of any dimension.
 */
class FrameToSignatureConverter {
    constructor(dimension, inputSpec, outputSpec) {
        this.dimension = dimension;
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
    }
    /**
     * Convert raw audio frame data into user-friendly function inputs.
     */
    prepareInputs(frame) {
        // TODO: fix this function.
        let streamIndex = 0;
        const inputs = [];
        for (const { type } of this.inputSpec) {
            // TODO: figure out how to pass multiple streams to a channel...
            const inputStreams = ArrayView.createSliceView(frame.audioStreams, streamIndex, streamIndex + type.numAudioStreams);
            const input = mapOverChannels(this.dimension, frame.audioStreams, channel => {
                type.channelFromAudioData({
                    audioStreams: inputStreams,
                    parameters: frame.parameters
                });
            });
            inputs.push(input);
        }
        return inputs;
    }
    normalizeOutputs(outputs) {
        // try-catch led to terrible performance, using validation instead.
        const originalErrors = this.validateOutputs(outputs);
        if (!originalErrors.length) {
            return outputs;
        }
        outputs = [outputs];
        const arrayErrors = this.validateOutputs(outputs);
        if (!arrayErrors.length) {
            return outputs;
        }
        throw new Error(`Unable to read outputs from processing function due to the following error(s):
${originalErrors.map(v => " - " + v).join("\n")}

Attempted to wrap output in an array, which failed as well:
${arrayErrors.map(v => " - " + v).join("\n")}`);
    }
    validateOutputs(outputs) {
        if (!isArrayLike(outputs)) {
            return [`Expected function outputs to be an array with the signature ${this.outputSpec} but got '${typeof outputs}' type instead.`];
        }
        if (outputs.length != this.outputSpec.length) {
            return [`Expected the function to have ${this.outputSpec.length} output(s), expressed as an array with length ${this.outputSpec.length}, but got array of length ${outputs.length} instead.`];
        }
        return map(outputs, (v, i) => {
            const spec = this.outputSpec[i];
            // TODO: account for different dimension in datatype string.
            if (!isCorrectOutput(this.dimension, v, spec.type)) {
                return `Error parsing output ${i} ('${spec.name}') of function with dimension='${this.dimension}'. Expected datatype ${spec.type}, given ${v}.`;
            }
            return '';
        }).filter(v => !!v);
    }
    __OLD__validateOutputs(outputs) {
        if (!isArrayLike(outputs)) {
            throw new Error(`Expected function outputs to be an array with the signature ${this.outputSpec} but got '${typeof outputs}' type instead.`);
        }
        if (outputs.length != this.outputSpec.length) {
            throw new Error(`Expected function outputs to be an array with size ${this.outputSpec.length} but got size ${outputs.length} instead.`);
        }
        const itOutputs = ArrayView.createSliceView(outputs);
        const checkLength = ["all", "time"].includes(this.dimension);
        for (const [output, spec] of zip(itOutputs, this.outputSpec)) {
            try {
                mapOverChannels(this.dimension, output, channel => spec.type.__OLD__validate(channel, { checkLength }));
            }
            catch (e) {
                e.message = `Error parsing output '${spec.name}' with expected datatype ${spec.type}. ${e.message}`;
                throw e;
            }
        }
    }
    /**
     * Convert user output back into raw data.
     */
    processOutputs(outputs) {
        const outputAudioStreamParts = [];
        for (const [output, specEntry] of zip(outputs, this.outputSpec)) {
            try {
                const streams = this.outputToAudioStreams(output, specEntry.type);
                outputAudioStreamParts.push(streams);
            }
            catch (e) {
                throw new Error(`Expected function outputs to be an array with the signature ${this.outputSpec} but unable to convert output '${specEntry.name}' to the expected type (${specEntry.type}): ${e.message}`);
            }
        }
        return {
            audioStreams: ArrayView.createConcatView(...outputAudioStreamParts)
        };
    }
    outputToAudioStreams(output, type) {
        const audioStreams = [];
        // Because channelToAudioData can return multiple streams, we have to do 
        // some funny business. The large dimension returned at the "channel" level 
        // needs to be pushed to the topmost dimension (output level).
        const channelByAudioStream = range(type.numAudioStreams).fill([]);
        // 1. Collect flattened output by audioStream index.
        mapOverChannels(this.dimension, output, channel => {
            // TODO: how to handle parameters? Are output parameters allowed?
            const data = type.__OLD__channelToAudioData(channel);
            for (const i of range(type.numAudioStreams)) {
                channelByAudioStream[i].push(data.audioStreams[i]);
            }
        });
        // 2. For each audioStream index, create a top-level audioStream by reading 
        // from the flattened array.
        for (const i of range(type.numAudioStreams)) {
            let j = 0; // Indexes the "flattened" array.
            const stream = mapOverChannels(this.dimension, output, _ => channelByAudioStream[i][j++]);
            audioStreams.push(stream);
        }
        return audioStreams;
    }
}

class ArrayFunctionality {
    constructor(length) {
        this.length = length;
        for (const i of range(length)) {
            Object.defineProperty(this, i, {
                get() {
                    return this.getItem(i);
                }
            });
        }
    }
    *[Symbol.iterator]() {
        for (const i of range(this.length)) {
            yield this[i];
        }
    }
}
/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
class TypedStreamSpec extends ArrayFunctionality {
    constructor({ names, numStreams, numChannelsPerStream, types }) {
        var _a, _b, _c;
        super((_c = (_b = (_a = numStreams !== null && numStreams !== void 0 ? numStreams : types === null || types === void 0 ? void 0 : types.length) !== null && _a !== void 0 ? _a : names === null || names === void 0 ? void 0 : names.length) !== null && _b !== void 0 ? _b : numChannelsPerStream === null || numChannelsPerStream === void 0 ? void 0 : numChannelsPerStream.length) !== null && _c !== void 0 ? _c : 0);
        types && (numStreams !== null && numStreams !== void 0 ? numStreams : (numStreams = types.length));
        if (names != undefined
            && numStreams != undefined
            && numStreams != names.length
            || numChannelsPerStream != undefined
                && numStreams != undefined
                && numStreams != numChannelsPerStream.length
            || numChannelsPerStream instanceof Array
                && names != undefined
                && numChannelsPerStream.length != names.length) {
            throw new Error(`If provided, numStreams, inputNames, and numChannelsPerStream must match. Given numStreams=${numStreams}, inputNames=${JSON.stringify(names)}, numChannelsPerStream=${numChannelsPerStream}.`);
        }
        // Store whether the names were auto-generated.
        this.hasNumberedNames = names == undefined;
        this.hasDefaultNumChannels = numChannelsPerStream == undefined;
        if (numChannelsPerStream != undefined) {
            const info = this.infoFromChannelsPerStream(numChannelsPerStream);
            numStreams !== null && numStreams !== void 0 ? numStreams : (numStreams = info.numStreams);
            names !== null && names !== void 0 ? names : (names = info.names);
        }
        else if (names != undefined) {
            const info = this.infoFromNames(names);
            numStreams !== null && numStreams !== void 0 ? numStreams : (numStreams = info.numStreams);
            numChannelsPerStream !== null && numChannelsPerStream !== void 0 ? numChannelsPerStream : (numChannelsPerStream = info.numChannelsPerStream);
        }
        else if (numStreams != undefined) {
            const info = this.infoFromNumStreams(numStreams);
            numChannelsPerStream !== null && numChannelsPerStream !== void 0 ? numChannelsPerStream : (numChannelsPerStream = info.numChannelsPerStream);
            names !== null && names !== void 0 ? names : (names = info.names);
        }
        else {
            throw new Error("At least one of (names, numStreams, numChannelsPerStream) must be specified.");
        }
        types !== null && types !== void 0 ? types : (types = names.map(_ => new audio()));
        // These will all be defined at this point.
        this.names = names;
        this.length = numStreams;
        this.numChannelsPerStream = numChannelsPerStream;
        this.types = types.map((v, i) => isType(v, IODatatype) ?
            v
            : IODatatype.create(v, this.names[i]));
    }
    static fromSerialized(streamSpec) {
        const types = streamSpec.types.map(t => t.name);
        return new TypedStreamSpec(Object.assign(Object.assign({}, streamSpec), { types }));
    }
    getItem(i) {
        return {
            name: this.names[i],
            numChannels: this.numChannelsPerStream[i],
            type: this.types[i]
        };
    }
    get totalNumChannels() {
        return sum(Object.values(this.numChannelsPerStream));
    }
    infoFromNames(names) {
        return {
            numStreams: names.length,
            numChannelsPerStream: range(names.length).fill(constants.DEFAULT_NUM_CHANNELS)
        };
    }
    infoFromNumStreams(numStreams) {
        return {
            numChannelsPerStream: range(numStreams).fill(constants.DEFAULT_NUM_CHANNELS),
            names: range(numStreams)
        };
    }
    infoFromChannelsPerStream(numChannelsPerStream) {
        return {
            names: range(numChannelsPerStream.length),
            numStreams: numChannelsPerStream.length
        };
    }
    toString() {
        const specString = map(this, data => {
            let streamString = `'${data.name}': ${data.type.name}`;
            if (data.numChannels) {
                streamString += ` (${data.numChannels} channels)`;
            }
            return streamString;
        }).join(", ");
        return `[${specString}]`;
    }
}
// Audio-only StreamSpec
class StreamSpec extends TypedStreamSpec {
    constructor({ names, numStreams, numChannelsPerStream }) {
        super({ names, numStreams, numChannelsPerStream });
    }
}

function contextPipe(fromContext, toContext) {
    const mediaStreamDestination = fromContext.createMediaStreamDestination();
    const mediaStreamSource = toContext.createMediaStreamSource(mediaStreamDestination.stream);
    return {
        sink: mediaStreamDestination,
        source: mediaStreamSource,
    };
}
function joinContexts(sourceContexts, destinationContext) {
    const source = destinationContext.createGain();
    const sinks = [];
    for (const src of sourceContexts) {
        const { source: input, sink: output } = contextPipe(src, destinationContext);
        input.connect(source);
        sinks.push(output);
    }
    return { sinks, source };
}

const BUFFER_WORKLET_NAME = "buffer-worklet";

class ToStringAndUUID extends TypedConfigurable {
    constructor() {
        super();
        this._uuid = crypto.randomUUID();
    }
    get _className() {
        return this.constructor.name == '_Configured' ?
            Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor.name
            : this.constructor.name;
    }
    toString() {
        return this._className;
    }
    get audioContext() {
        return this.config.audioContext;
    }
    static get audioContext() {
        return this.config.audioContext;
    }
}

class AbstractInput extends ToStringAndUUID {
    constructor(name, parent, isRequired) {
        super();
        this.name = name;
        this.parent = parent;
        this.isRequired = isRequired;
        this.validate = () => null;
    }
    get defaultInput() {
        return this;
    }
    get isAudioStream() {
        return this.defaultInput instanceof this._.AudioRateInput;
    }
    get isStftStream() {
        return this.defaultInput instanceof this._.FFTInput;
    }
    get isControlStream() {
        return this.defaultInput instanceof this._.ControlInput;
    }
    __call__(value = constants.TRIGGER) {
        this.setValue(value);
    }
    trigger() {
        this.setValue(constants.TRIGGER);
    }
    toString() {
        if (this.parent == undefined) {
            return `${this._className}('${this.name}')`;
        }
        return `${this.parent._className}.inputs.${this.name}`;
    }
    ofType(type) {
        this.withValidator(createTypeValidator(type));
        return this;
    }
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn) {
        this.validate = wrapValidator(validatorFn);
        return this;
    }
}

class BaseConnectable extends ToStringAndUUID {
    get isAudioStream() {
        return this.defaultOutput instanceof this._.AudioRateOutput;
    }
    get isStftStream() {
        return this.defaultOutput instanceof this._.FFTOutput;
    }
    get isControlStream() {
        return this.defaultOutput instanceof this._.ControlOutput;
    }
    getDestinationInfo(destination) {
        if (isFunction(destination)) {
            if (this.isControlStream) {
                destination = new this._.FunctionComponent(destination);
            }
            else if (this instanceof this._.BundleComponent) {
                // TODO: consider not using the *max* num channels.
                const numChannelsPerInput = range(this.length).fill(this.numOutputChannels);
                destination = new this._.AudioTransformComponent(destination, {
                    inputSpec: new StreamSpec({
                        numChannelsPerStream: numChannelsPerInput
                    })
                });
            }
            else {
                // TODO: move away from ths unsafe conversion...or make sure it's safe 
                // by ensuring it's either BaseComponent or AudioRateOutput?
                const numInputChannels = this.numOutputChannels;
                destination = new this._.AudioTransformComponent(destination, {
                    inputSpec: new StreamSpec({
                        numChannelsPerStream: [numInputChannels]
                    })
                });
            }
        }
        let component;
        let input;
        if (isType(destination, [AudioNode, AudioParam])) {
            component = new this._.AudioComponent(destination);
            input = component.getDefaultInput();
        }
        else if (isType(destination, AbstractInput)) {
            // TODO: can this typing issue be fixed? isType not working with abstract
            // classes.
            component = destination.parent;
            input = destination;
        }
        else if (isComponent(destination)) {
            component = destination;
            input = component.getDefaultInput();
        }
        else {
            throw new Error("Improper input type for connect(). " + destination);
        }
        if (destination instanceof TypedConfigurable && destination.configId != this.configId) {
            throw new Error(`Unable to connect components from different namespaces. Given ${this} (config ID: ${this.configId}) and ${destination} (config ID: ${destination.configId})`);
        }
        return { component, input };
    }
}

function getNumInputChannels(node) {
    var _a;
    if (node instanceof ChannelSplitterNode) {
        return node.numberOfOutputs;
    }
    else if (node instanceof ChannelMergerNode) {
        return node.numberOfInputs;
    }
    // @ts-ignore Property undefined.
    return (_a = node['__numInputChannels']) !== null && _a !== void 0 ? _a : (node instanceof AudioNode ? node.channelCount : 1);
}
function getNumOutputChannels(node) {
    var _a;
    if (node instanceof ChannelSplitterNode) {
        return node.numberOfOutputs;
    }
    else if (node instanceof ChannelMergerNode) {
        return node.numberOfInputs;
    }
    // @ts-ignore Property undefined.
    return (_a = node['__numOutputChannels']) !== null && _a !== void 0 ? _a : (node instanceof AudioNode ? node.channelCount : 1);
}
function createMultiChannelView(multiChannelIO, supportsMultichannel) {
    let channels = [];
    if (!supportsMultichannel) {
        return toMultiChannelArray(channels);
    }
    const numChannels = 'numInputChannels' in multiChannelIO ? multiChannelIO.numInputChannels : multiChannelIO.numOutputChannels;
    for (let c = 0; c < numChannels; c++) {
        channels.push(createChannelView(multiChannelIO, c));
    }
    return toMultiChannelArray(channels);
}
function createChannelView(multiChannelIO, activeChannel) {
    return new Proxy(multiChannelIO, {
        get(target, p, receiver) {
            if (p === 'activeChannel') {
                return activeChannel;
            }
            else if (['channels', 'left', 'right'].includes(String(p))) {
                throw new Error(`Forbidden property: '${String(p)}'. A channel view stores only a single channel.`);
            }
            else {
                return Reflect.get(target, p, receiver);
            }
        }
    });
}
/**
 * Call the correct WebAudio methods to connect channels.
 */
function simpleConnect(source, destination, fromChannel = 0, toChannel = 0) {
    if (destination instanceof AudioParam) {
        return source.connect(destination, fromChannel);
    }
    else {
        return source.connect(destination, fromChannel, toChannel);
    }
}
/**
 * Call the correct WebAudio methods to connect the selected channels, if any.
 * TODO: Bring channel splitter / merger logic into the components,
 * lazy-initialized when channels is accessed.
 *
 * @param source
 * @param destination
 * @param fromChannel
 * @param toChannel
 */
function connectWebAudioChannels(audioContext, source, destination, fromChannel = undefined, toChannel = undefined) {
    if (fromChannel != undefined) {
        // Source -> Splitter -> [Dest]
        // Main connection: Splitter -> Dest
        const splitter = audioContext.createChannelSplitter();
        source = source.connect(splitter);
    }
    if (toChannel != undefined) {
        // [Source] -> Merger -> Dest
        // Main connection: Source -> Merger
        const merger = audioContext.createChannelMerger();
        return source.connect(merger, fromChannel, toChannel).connect(destination);
    }
    //console.log(`Connecting ${source.constructor.name} [channel=${fromChannel ?? "*"}] to ${destination} [channel=${toChannel ?? "*"}]`)
    return simpleConnect(source, destination, fromChannel, toChannel);
}

class AudioRateInput extends AbstractInput {
    get numInputChannels() {
        return this.activeChannel ? 1 : getNumInputChannels(this.audioSink);
    }
    constructor(name, parent, audioSink) {
        super(name, parent, false);
        this.name = name;
        this.parent = parent;
        this.audioSink = audioSink;
        this.activeChannel = undefined;
        this.channels = createMultiChannelView(this, audioSink instanceof AudioNode);
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get value() {
        return this.audioSink instanceof AudioParam ? this.audioSink.value : 0;
    }
    setValue(value) {
        this.validate(value);
        if (value == constants.TRIGGER) {
            value = this.value;
        }
        if (this.audioSink instanceof AudioParam && isType(value, Number)) {
            this.audioSink.setValueAtTime(value, 0);
        }
    }
}
// TODO: implement AudioParam interface.
/*
export class AudioParamControlOutput extends ControlOutput<any> implements AudioParam {
  connections: AudioParam[]
  connect(destination: CanBeConnectedTo) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      this.connections.push(destination)
    } else {
      throw new Error("The output must be an audio-rate input.")
    }
    return destination
  }
  protected map(key: keyof AudioParam, args: any): this {
    for (let connection of this.connections) {
      connection[key](...args)
    }
    return this
  }
  cancelAndHoldAtTime(cancelTime: number) {
    return this.map('cancelAndHoldAtTime', arguments)
  }
  cancelScheduledValues(cancelTime: number) {
    return this.map('cancelScheduledValues', arguments)
  }
  exponentialRampToValueAtTime(value: number, endTime: number) {
    return this.map('exponentialRampToValueAtTime', arguments)
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    return this.map('linearRampToValueAtTime', arguments)
  }
  setTargetAtTime(value: number, startTime: number, timeConstant: number) {
    return this.map('setTargetAtTime', arguments)
  }
  setValueAtTime(value: number, startTime: number) {
    return this.map('setValueAtTime', arguments)
  }
  setValueCurveAtTime(values: number[], startTime: number, duration: number) {
    return this.map('setValueCurveAtTime', arguments)
  }
} */

/**
 * A decorator to allow properties to be computed once, only when needed.
 *
 * Usage:
 *
 * @example
 * class A {
 *   \@jit(Math.random)
 *   iprop1: number
 *
 *   \@jit((_, propName) => "expensive computation of " + propName))
 *   static sprop1: number
 * }
 *
 */
function lazyProperty(initializer) {
    return function (target, prop) {
        initializer = initializer.bind(target);
        Object.defineProperty(target, prop, {
            get() {
                var _a;
                const secretKey = `__${prop}__`;
                return (_a = this[secretKey]) !== null && _a !== void 0 ? _a : (this[secretKey] = initializer(this, prop));
            }
        });
    };
}
/**
 * Declare that a function's parameters may be promises, and the function will perform its action once all promises are resolved and return a promise.
 */
function resolvePromiseArgs(obj, propName, descriptor) {
    const func = descriptor.value;
    descriptor.value = function (...args) {
        // NOTE: 'this' within func will be unbound, but it is bound in 
        // descriptor.value. So it must be rebound.
        if (args.some(a => a instanceof Promise)) {
            // Wait for all to be resolved, then call the function.
            return Promise.all(args).then(vals => func.bind(this)(...vals));
        }
        else {
            return func.bind(this)(...args);
        }
    };
    return descriptor;
}

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// TODO: remove this and HybridOutput.
class HybridInput extends AbstractInput {
    get numInputChannels() {
        return this.activeChannel ? 1 : getNumInputChannels(this.audioSink);
    }
    // Hybrid input can connect an audio input to a sink, but it also can
    // receive control inputs.
    constructor(name, parent, audioSink, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        super(name, parent, isRequired);
        this.name = name;
        this.parent = parent;
        this.audioSink = audioSink;
        this.isRequired = isRequired;
        this.activeChannel = undefined;
        this._value = defaultValue;
        this.channels = createMultiChannelView(this, audioSink instanceof AudioNode);
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _a;
        value = value;
        this.validate(value);
        if (value == constants.TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        if (isFinite(+value) && isType(this.audioSink, AudioParam)) {
            this.audioSink.setValueAtTime(+value, 0);
        }
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
__decorate$3([
    resolvePromiseArgs
], HybridInput.prototype, "setValue", null);

// A special wrapper for a symbolic input that maps object signals to property assignments.
// let i = new ComponentInput(parent)
// TODO: replace this whole class with compound input. This may require 
// refactoring of some code that relies on this class being a AudioRateInput 
// and having an audioNode.
// i.setValue({ input1: "val1", input2: "val2" })  // sets vals on parent.
class ComponentInput extends AudioRateInput {
    get defaultInput() {
        return this._defaultInput;
    }
    constructor(name, parent, defaultInput) {
        const audioNode = (defaultInput instanceof AudioRateInput || defaultInput instanceof HybridInput) ? defaultInput.audioSink : undefined;
        super(name, parent, audioNode); // TODO: fix this issue...
        this.name = name;
        this._defaultInput = defaultInput;
        /* this._value = defaultInput?.value */
    }
    setValue(value) {
        var _a;
        /*     console.log("setting value")
            console.log([value, this.toString()]) */
        this.validate(value);
        // JS objects represent collections of parameter names and values
        const isPlainObject = (value === null || value === void 0 ? void 0 : value.constructor) === Object;
        if (isPlainObject && !value["_raw"]) {
            // Validate each param is defined in the target.
            for (let key in value) {
                if (!(this.parent && key in this.parent.inputs)) {
                    throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}'. To pass a raw object without changing properties, set _raw: true on the object.`);
                }
            }
            for (let key in value) {
                (_a = this.parent) === null || _a === void 0 ? void 0 : _a.inputs[key].setValue(value[key]);
            }
        }
        else if (this.defaultInput == undefined) {
            const inputs = this.parent == undefined ? [] : Object.keys(this.parent.inputs);
            throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${inputs}], or send a message as a plain JS object, with one or more input names as keys. Given ${JSON.stringify(value)}`);
        }
        else {
            isPlainObject && delete value["_raw"];
            this.defaultInput.setValue(value);
        }
    }
}

class AbstractOutput extends BaseConnectable {
    constructor(name, parent) {
        super();
        this.name = name;
        this.parent = parent;
        this.validate = () => null;
        this.connections = [];
        this.callbacks = [];
    }
    ofType(type) {
        this.withValidator(createTypeValidator(type));
        return this;
    }
    toString() {
        if (this.parent == undefined) {
            return `${this._className}('${this.name}')`;
        }
        return `${this.parent._className}.outputs.${this.name}`;
    }
    get defaultOutput() {
        return this;
    }
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn) {
        this.validate = wrapValidator(validatorFn);
        return this;
    }
}

// TODO: Add a GainNode here to allow muting and mastergain of the component.
class AudioRateOutput extends AbstractOutput {
    constructor(name, audioNode, parent) {
        super(name, parent);
        this.name = name;
        this.audioNode = audioNode;
        this.parent = parent;
        this._channels = undefined;
        this.activeChannel = undefined;
    }
    get channels() {
        var _a;
        return (_a = this._channels) !== null && _a !== void 0 ? _a : (this._channels = createMultiChannelView(this, true));
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get numInputChannels() {
        return this.activeChannel != undefined ? 1 : getNumInputChannels(this.audioNode);
    }
    get numOutputChannels() {
        return this.activeChannel != undefined ? 1 : getNumOutputChannels(this.audioNode);
    }
    toString() {
        const superCall = super.toString();
        return this.activeChannel == undefined ?
            superCall
            : `${superCall}.channels[${this.activeChannel}]`;
    }
    connectNodes(from, to, fromChannel = undefined, toChannel = undefined) {
        to && connectWebAudioChannels(this.audioContext, from, to, fromChannel, toChannel);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        input = input instanceof ComponentInput ? input.defaultInput : input;
        if (!input) {
            const inputs = component == undefined ? [] : Object.keys(component.inputs);
            throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${inputs}]`);
        }
        if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use 'AudioRateSignalSampler' to force a conversion.`);
        }
        this.connectNodes(this.audioNode, input.audioSink, this.activeChannel, input.activeChannel);
        this.connections.push(input);
        component === null || component === void 0 ? void 0 : component.wasConnectedTo(this);
        return component;
    }
    sampleSignal(samplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
    }
    // TODO: Make a single global sampler so that all signals are logged together.
    logSignal({ samplePeriodMs = 1000, format } = {}) {
        if (!format) {
            format = "";
            // Maybe add parent
            if (this.parent != undefined) {
                const shortId = this.parent._uuid.split("-")[0];
                format += `${this.parent.constructor.name}#${shortId}.`;
            }
            format += this.name;
            // Maybe add channel spec
            if (this.activeChannel != undefined) {
                format += `.channels[${this.activeChannel}]`;
            }
            format += ": {}";
        }
        // TODO: Could this be optimized? Also, make this log the array, each channel.
        this.config.logger.register(this, format);
        return this;
    }
    splitChannels(...inputChannelGroups) {
        if (inputChannelGroups.length > 32) {
            throw new Error("Can only split into 32 or fewer channels.");
        }
        if (!inputChannelGroups.length) {
            // Split each channel separately: [0], [1], [2], etc.
            for (let i = 0; i < this.numOutputChannels; i++) {
                inputChannelGroups.push([i]);
            }
            /* // Seems to be broken? Consider removing "channel views" as they do not
            // have a correct channel count etc.
            // This is an optimization that returns the channel views instead of
            // split+merged channels.
            return this.channels */
        }
        return this.connect(new this._.ChannelSplitter(...inputChannelGroups));
    }
    transformAudio(fn, { windowSize, useWorklet, dimension = "none" } = {}) {
        const options = {
            dimension,
            windowSize,
            useWorklet,
            numChannelsPerInput: [this.numOutputChannels],
            numInputs: 1
        };
        const transformer = new this._.AudioTransformComponent(fn, options);
        return this.connect(transformer.inputs[0]); // First input of the function.
    }
    disconnect(destination) {
        // TODO: implement this and utilize it for temporary components / nodes.
        console.warn("Disconnect not yet supported.");
    }
    /**
     * Return the current audio samples.
     */
    capture(numSamples) {
        const recorder = new this._.AudioRecordingComponent();
        this.connect(recorder);
        const buffer = recorder.capture(numSamples);
        this.disconnect(recorder);
        return buffer;
    }
    fft(fftSize = 128) {
        const component = new this._.FFTComponent(fftSize);
        this.connect(component.realInput);
        this.connect(component.imaginaryInput);
        return component.fftOut;
    }
}

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ControlInput extends AbstractInput {
    constructor(name, parent, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        super(name, parent, isRequired);
        this.name = name;
        this.numInputChannels = 1;
        this._value = defaultValue;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _a;
        value = value;
        this.validate(value);
        if (value == constants.TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
__decorate$2([
    resolvePromiseArgs
], ControlInput.prototype, "setValue", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ControlOutput extends AbstractOutput {
    constructor() {
        super(...arguments);
        this.numOutputChannels = 1;
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        // TODO: fix... should be "destination" but won't work for non-connectables like Function.
        /* const connectable = destination instanceof AbstractInput ? destination : component */
        // Conversion. TODO: figure out how to treat ComponentInput.
        if (input instanceof AudioRateInput && !(input instanceof ComponentInput)) {
            const converter = new this._.ControlToAudioConverter();
            converter.connect(input);
            input = converter.input;
        }
        this.connections.push(input);
        return component;
    }
    setValue(value, rawObject = false) {
        value = value;
        this.validate(value);
        if ((value === null || value === void 0 ? void 0 : value.constructor) === Object && rawObject) {
            value = Object.assign({ _raw: true }, value);
        }
        for (let c of this.connections) {
            c.setValue(value);
        }
        for (const callback of this.callbacks) {
            callback(value);
        }
    }
    onUpdate(callback) {
        this.callbacks.push(callback);
    }
}
__decorate$1([
    resolvePromiseArgs
], ControlOutput.prototype, "setValue", null);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// TODO: consider removing this class. Or not? Can be repurposed to handle fft data along with control and audio-rate.
class HybridOutput extends AudioRateOutput {
    connect(destination) {
        let { input } = this.getDestinationInfo(destination);
        input = input instanceof ComponentInput && input.defaultInput instanceof AudioRateInput ? input.defaultInput : input;
        if (isType(input, [ControlInput, ComponentInput])) {
            return ControlOutput.prototype.connect.bind(this)(destination);
        }
        else if (input instanceof AudioRateInput || input instanceof HybridInput) {
            return AudioRateOutput.prototype.connect.bind(this)(destination);
        }
        else {
            throw new Error("Unable to connect to " + destination);
        }
    }
    setValue(value, rawObject = false) {
        ControlOutput.prototype.setValue.bind(this)(value, rawObject);
    }
    onUpdate(callback) {
        this.callbacks.push(callback);
    }
}
__decorate([
    resolvePromiseArgs
], HybridOutput.prototype, "setValue", null);

const SPEC_MATCH_REST_SYMBOL = "*";
const SPEC_SPLIT_SYMBOL = ",";
class BaseComponent extends BaseConnectable {
    constructor() {
        super();
        this.isComponent = true;
        this.inputs = {};
        this.outputs = {};
        // Reserved default inputs.
        this.isBypassed = this.defineControlInput('isBypassed', false);
        this.isMuted = this.defineControlInput('isMuted', false);
        this.triggerInput = this.defineControlInput('triggerInput');
        // Special inputs that are not automatically set as default I/O.
        this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput];
        this._reservedOutputs = [];
        this.preventIOOverwrites();
    }
    logSignal({ samplePeriodMs = 1000, format } = {}) {
        this.getAudioOutputProperty('logSignal')({
            samplePeriodMs,
            format
        });
        return this;
    }
    capture(numSamples) {
        return this.getAudioOutputProperty('capture')(numSamples);
    }
    toString() {
        function _getNames(obj, except) {
            let entries = Object.keys(obj).filter(i => !except.includes(obj[i]));
            if (entries.length == 1) {
                return `${entries.join(", ")}`;
            }
            return `(${entries.join(", ")})`;
        }
        let inp = _getNames(this.inputs, this._reservedInputs);
        let out = _getNames(this.outputs, this._reservedOutputs);
        return `${this._className}(${inp} => ${out})`;
    }
    now() {
        return this.audioContext.currentTime;
    }
    validateIsSingleton() {
        const Class = this.constructor;
        if (Class.instanceExists) {
            throw new Error(`Only one instance of ${this.constructor} can exist.`);
        }
        Class.instanceExists = true;
    }
    preventIOOverwrites() {
        Object.keys(this.inputs).map(this.freezeProperty.bind(this));
        Object.keys(this.outputs).map(this.freezeProperty.bind(this));
    }
    freezeProperty(propName) {
        Object.defineProperty(this, propName, {
            writable: false,
            configurable: false
        });
    }
    defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsObject) {
        inputsOrOutputsObject[propName] = inputOrOutput;
        return inputOrOutput;
    }
    defineOutputAlias(name, output) {
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineInputAlias(name, input) {
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineControlInput(name, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        let input = new this._.ControlInput(name, this, defaultValue, isRequired);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineCompoundInput(name, inputs, defaultInput) {
        let input = new this._.CompoundInput(name, this, inputs, defaultInput);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineAudioInput(name, destinationNode) {
        let input = new this._.AudioRateInput(name, this, destinationNode);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineHybridInput(name, destinationNode, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        let input = new this._.HybridInput(name, this, destinationNode, defaultValue, isRequired);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineCompoundOutput(name, outputs, defaultOutput) {
        let output = new this._.CompoundOutput(name, outputs, this, defaultOutput);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineControlOutput(name) {
        let output = new this._.ControlOutput(name, this);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineAudioOutput(name, audioNode) {
        let output = new this._.AudioRateOutput(name, audioNode, this);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineHybridOutput(name, audioNode) {
        let output = new this._.HybridOutput(name, audioNode, this);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    setDefaultInput(input) {
        this._defaultInput = input;
    }
    setDefaultOutput(output) {
        this._defaultOutput = output;
    }
    // TODO: replace with getter.
    getDefaultInput() {
        const name = '[[default]]';
        if (this._defaultInput) {
            return new this._.ComponentInput(name, this, this._defaultInput);
        }
        // Skip reserved inputs, e.g. isMuted / isBypassed
        const ownInputs = Object.values(this.inputs).filter(i => !this._reservedInputs.includes(i));
        if (ownInputs.length == 1) {
            return new this._.ComponentInput(name, this, ownInputs[0]);
        }
        return new this._.ComponentInput(name, this);
    }
    get defaultOutput() {
        if (this._defaultOutput) {
            return this._defaultOutput;
        }
        // Skip reserved outputs
        const ownOutputs = Object.values(this.outputs).filter(i => !this._reservedOutputs.includes(i));
        if (ownOutputs.length == 1) {
            return ownOutputs[0];
        }
    }
    get defaultInput() {
        return this.getDefaultInput();
    }
    allInputsAreDefined() {
        let violations = [];
        for (let inputName in this.inputs) {
            let input = this.inputs[inputName];
            if (input.isRequired && input.value == constants.UNSET_VALUE) {
                violations.push(inputName);
            }
        }
        return !violations.length;
        /* if (violations.length) {
          throw new Error(`Unable to run ${this}. The following inputs are marked as required but do not have inputs set: [${violations}]`)
        } */
    }
    propagateUpdatedInput(inputStream, newValue) {
        if (inputStream == this.isBypassed) {
            this.onBypassEvent(newValue);
        }
        else if (inputStream == this.isMuted) {
            this.onMuteEvent(newValue);
        }
        if (inputStream == this.triggerInput) {
            // Always execute function, even if it's unsafe.
            // TODO: should this really pass undefined here? Or call for EVERY input?
            this.inputDidUpdate(undefined, undefined);
        }
        else if (this.allInputsAreDefined()) {
            this.inputDidUpdate(inputStream, newValue);
        }
        else {
            console.warn("Not passing event because not all required inputs are defined.");
        }
    }
    // Abstract methods.
    outputAdded(destintion) { }
    inputAdded(source) { }
    onBypassEvent(event) { }
    onMuteEvent(event) { }
    inputDidUpdate(input, newValue) { }
    setBypassed(isBypassed = true) {
        this.isBypassed.setValue(isBypassed);
    }
    setMuted(isMuted = true) {
        this.isMuted.setValue(isMuted);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        // || (input instanceof ComponentInput && !input.defaultInput) causes dict 
        // outputs to not work
        if (!input) {
            const inputs = component == undefined ? [] : Object.keys(component.inputs);
            throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${inputs}]`);
        }
        component && this.outputAdded(input);
        const output = this.defaultOutput;
        if (!output) {
            throw new Error(`No default output found for ${this}, so unable to connect to destination: ${component}. Found named outputs: [${Object.keys(this.outputs)}]`);
        }
        output.connect(input);
        return component;
    }
    withInputs(argDict) {
        var _a, _b;
        for (const name in argDict) {
            const thisInput = (_b = (_a = this.inputs[name]) !== null && _a !== void 0 ? _a : this.inputs["" + name]) !== null && _b !== void 0 ? _b : this.inputs["$" + name];
            if (!thisInput)
                continue;
            const argValue = argDict[name];
            if (argValue instanceof Object && 'connect' in argValue) {
                argValue.connect(thisInput);
            }
            else {
                thisInput.setValue(argValue);
            }
        }
        return this;
    }
    setValues(valueObj) {
        return this.getDefaultInput().setValue(valueObj);
    }
    wasConnectedTo(other) {
        this.inputAdded(other);
        return other;
    }
    getInputsBySpecs(inputSpecs) {
        return this.getBySpecs(inputSpecs, this.inputs);
    }
    getChannelsBySpecs(channelSpecs) {
        const output = this.defaultOutput;
        if (!(output instanceof AudioRateOutput || output instanceof HybridOutput)) {
            throw new Error("No default audio-rate output found. Select a specific output to use this operation.");
        }
        // Convert to stringified numbers.
        const numberedSpecs = channelSpecs.map(spec => {
            const toNumber = (c) => {
                const noSpace = String(c).replace(/s/g, "");
                if (noSpace == "left")
                    return "0";
                if (noSpace == "right")
                    return "1";
                return String(c);
            };
            return spec instanceof Array ? spec.map(toNumber) : toNumber(spec);
        });
        const channelObj = arrayToObject(output.channels);
        return this.getBySpecs(numberedSpecs, channelObj);
    }
    getOutputsBySpecs(outputSpecs) {
        return this.getBySpecs(outputSpecs, this.outputs);
    }
    /**
     * Given an array of strings specifying which inputs/outputs to select, return an array of the same length where each entry contains the inputs/outputs matched by that spec.
     *
     * Each spec is one of:
     * 1. A string representing a specific input or output name. Example: `"in1"`.
     * 2. An array of input or output names. Example: `["in1", "in2"]`.
     * 3. A stringified version of (2). Example: `"in1, in2"`.
     * 4. The string `"*"` which means to match any unspecified. This may only appear once.
     *
     * NOTE: Any spaces will be removed, so `"in1,in2"`, `" in1 , in2 "`, and `"in1, in2"` are equivalent.
     */
    getBySpecs(specs, obj) {
        // Remove spaces.
        specs = specs.map(spec => {
            const removeSpaces = (s) => String(s).replace(/s/g, "");
            return spec instanceof Array ? spec.map(removeSpaces) : removeSpaces(spec);
        });
        const matchedObjects = specs.map(() => []);
        const matchedKeys = new Set();
        const starIndices = []; // Indices i in the list where specs[i] = "*"
        for (let [i, spec] of enumerate(specs)) {
            if (spec == SPEC_MATCH_REST_SYMBOL) {
                starIndices.push(i);
                continue;
            }
            else if (!(spec instanceof Array)) {
                spec = spec.split(SPEC_SPLIT_SYMBOL);
            }
            spec.forEach(key => {
                if (matchedKeys.has(key)) {
                    throw new Error(`Invalid spec. At most one instance of each key may be specified, but '${key}' was mentioned multiple times. Given: ${JSON.stringify(specs)}`);
                }
                matchedKeys.add(key);
            });
            matchedObjects[i] = spec.map(key => obj[key]);
        }
        if (starIndices.length > 1) {
            throw new Error(`Invalid spec. At most one key may be '*'. Given: ${JSON.stringify(specs)}`);
        }
        else if (starIndices.length == 1) {
            // Get any unmatched inputs/outputs.
            matchedObjects[starIndices[0]] = Object.keys(obj)
                .filter(key => !matchedKeys.has(key))
                .map(key => obj[key]);
        }
        return matchedObjects;
    }
    perOutput(functions) {
        if (functions instanceof Array)
            functions = arrayToObject(functions);
        const result = {};
        const keys = Object.keys(functions);
        const outputGroups = this.getOutputsBySpecs(keys);
        for (const [key, outputGroup] of zip(keys, outputGroups)) {
            if (isFunction(functions[key])) {
                // TODO: support these specs.
                if (key.includes(SPEC_SPLIT_SYMBOL)
                    || key.includes(SPEC_MATCH_REST_SYMBOL)) {
                    throw new Error("Array and rest specs not currently supported.");
                }
                const res = functions[key](outputGroup[0]);
                res && (result[key] = res);
            }
            // Otherwise, leave it out. TODO: Throw error if not explicitly null
            // or undefined?
        }
        return new this._.BundleComponent(result);
    }
    perChannel(functions) {
        var _a;
        if (functions instanceof Array)
            functions = arrayToObject(functions);
        const keys = Object.keys(functions);
        const outputGroups = this.getChannelsBySpecs(keys);
        const result = Array(outputGroups.length).fill(undefined);
        const toNum = (c) => {
            const noSpace = String(c).replace(/s/g, "");
            if (noSpace == "left")
                return 0;
            if (noSpace == "right")
                return 1;
            return c;
        };
        for (const [key, outputGroup] of zip(keys, outputGroups)) {
            if (isFunction(functions[key])) {
                // TODO: support these specs.
                if (key.includes(SPEC_SPLIT_SYMBOL)
                    || key.includes(SPEC_MATCH_REST_SYMBOL)) {
                    throw new Error("Array and rest specs not currently supported.");
                }
                const res = functions[key](outputGroup[0]);
                // NOTE: res.defaultOutput?.left is used because sometimes the output 
                // from the function may be multichannel.
                // TODO: reconsider.
                res && (result[toNum(key)] = (_a = res.defaultOutput) === null || _a === void 0 ? void 0 : _a.left);
            }
            // Otherwise, leave it out. TODO: Throw error if not explicitly null
            // or undefined?
        }
        return this._.ChannelStacker.fromInputs(result);
    }
    // Delegate the property to the default audio output (if any).
    getAudioOutputProperty(propName) {
        const output = this.defaultOutput;
        if (output instanceof AudioRateOutput) {
            const prop = output[propName];
            return isFunction(prop) ? prop.bind(output) : prop;
        }
        else {
            throw new Error(`Cannot get property '${propName}'. No default audio-rate output found for ${this}. Select an audio-rate output and use 'output.${propName}' instead.`);
        }
    }
    /** Methods delegated to default audio input / output. **/
    get numInputChannels() {
        return this.getDefaultInput().numInputChannels;
    }
    get numOutputChannels() {
        return this.getAudioOutputProperty('numOutputChannels');
    }
    sampleSignal(samplePeriodMs) {
        return this.getAudioOutputProperty('sampleSignal')(samplePeriodMs);
    }
    splitChannels(...inputChannelGroups) {
        return this.getAudioOutputProperty('splitChannels')(...inputChannelGroups);
    }
    // TODO: these should work as both inputs and outputs.
    get left() {
        return this.getAudioOutputProperty('left');
    }
    get right() {
        return this.getAudioOutputProperty('right');
    }
    get channels() {
        return this.getAudioOutputProperty('channels');
    }
    transformAudio(fn, { windowSize, useWorklet, dimension = "none" } = {}) {
        return this.getAudioOutputProperty('transformAudio')(fn, { dimension, windowSize, useWorklet });
    }
    fft(fftSize = 128) {
        return this.getAudioOutputProperty('fft')(fftSize);
    }
}
BaseComponent.instanceExists = false;

class BufferComponent extends BaseComponent {
    constructor(buffer) {
        var _a;
        super();
        const numChannels = (_a = buffer === null || buffer === void 0 ? void 0 : buffer.numberOfChannels) !== null && _a !== void 0 ? _a : 2;
        this.worklet = new AudioWorkletNode(this.audioContext, BUFFER_WORKLET_NAME, {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [numChannels],
            processorOptions: {
                buffer,
                bufferId: buffer ? getBufferId(buffer) : undefined
            }
        });
        // @ts-ignore Property undefined.
        this.worklet['__numInputChannels'] = numChannels;
        // @ts-ignore Property undefined.
        this.worklet['__numOutputChannels'] = numChannels;
        // Input
        this.buffer = this.defineControlInput('buffer', buffer, true).ofType(AudioBuffer);
        this.time = this.defineAudioInput('time', this.worklet).ofType(Number);
        // Output
        this.output = this.defineAudioOutput('output', this.worklet).ofType(Number);
        buffer && this.setBuffer(buffer);
    }
    get bufferId() {
        return getBufferId(this.buffer.value);
    }
    setBuffer(buffer) {
        this.worklet.port.postMessage({
            buffer: bufferToFloat32Arrays(buffer),
            bufferId: this.bufferId
        });
    }
    inputDidUpdate(input, newValue) {
        if (input == this.buffer) {
            if (newValue.numberOfChannels != this.buffer.value.numberOfChannels) {
                // TODO: better error message.
                throw new Error("Wrong number of channels");
            }
            this.setBuffer(newValue);
        }
    }
}

function _throwUnregisteredError(Class) {
  throw new ReferenceError(`Cannot access config. The class '${Class.name}' must be registered by including it within 'publicClasses' or 'internals' when building a NamespaceTemplate.`)
}


function _defineStaticAndInstanceGetter(Class, getterName, hiddenPropName) {
  // Static getter returns the value of the hidden static prop.
  Object.defineProperty(Class, getterName, {
    get() {
      return this[hiddenPropName] || _throwUnregisteredError(this)
    }
  });
  // Instance getter delegates to the static getter.
  Object.defineProperty(Class.prototype, getterName, {
    get() {
      return this.constructor[getterName]
    }
  });
}

function _mightBeClass(obj) {
  return (obj instanceof Function) && (obj.prototype != undefined)
}

function _makeConfigurable(cls, inPlace=true, allowAlready=true) {
  let Class;
  if (inPlace) {
    Class = cls;
  } else {
    Class = (class Class extends cls {});  // Hmm...
  }
  if (!allowAlready && (Class.__isConfigurable__ || Class.prototype instanceof Configurable)) {
    throw new Error(`The class '${Class.name}' is already configurable.`)
  }
  // Define hidden static props. These are expected to be overridden:
  // 1. By the defaults when the class is registered.
  // 2. By a subclass when a namespace with a new config is created.
  Class.__config__ = undefined;
  Class.__namespace__ = undefined;
  Class.__configId__ = undefined;
  Class.__isConfigurable__ = true;

  // Define hybrid getters for (config, _, configId)
  _defineStaticAndInstanceGetter(Class, 'config', '__config__');
  _defineStaticAndInstanceGetter(Class, '_', '__namespace__');
  _defineStaticAndInstanceGetter(Class, 'configId', '__configId__');
  return Class
}

/**
 * Define stache getters that allow the class to access `_`, `config`, and `configId`.
 * 
 * **NOTE:** Using this function is not strictly necessary and only helps detect when this class has not been properly registered. Prefer inheriting from `stache.Configurable`.
 * 
 * @param {Class} cls A class that you want to explicitly set as configurable.
 * @param {boolean} inPlace Whether to modify the class in-place.
 * @returns {Class} A version of `cls` with getters implemented for `_`, `config`, and `configId`.
 */
function makeConfigurable(cls, inPlace=true) {
  return _makeConfigurable(cls, inPlace)
}

/**
 * The base class for defining objects configurable by the `stache` library. Inheriting from this class is not strictly necessary to use library, but it comes with two advantages:
 * 1. Static analysis will recognize the `config`, `configId`, and `_` properties on the class ("stache properties").
 * 2. Easier bug fixing. An error will be thrown if you try to access the stache properties without adding the class to a `NamespaceTemplate`.
 * 
 * If inheriting from this class is not possible, calling `stache.makeConfigurable(MyClass)` will retain advantage #2.
 * 
 * @example
 * // Registration
 * class MyPublicClass extends stache.Configurable {};
 * class MyInternalClass extends stache.Configurable {};
 * const defaultConfig = { myProp: 'default' };
 * const withConfig = registerAndCreateFactoryFn(defaultConfig, { MyPublicClass }, { MyInternalClass });
 * // Usage
 * const ns1 = withConfig({ myProp: 'value1' });
 * const configuredCls = new ns1.MyPublicClass();
 * console.log(configuredCls.config);  // { myProp: 'value1' }
 * console.log(configuredCls._);  // { MyInternalClass: ... }
 */
class Configurable {
  /* @ignore */
  static __isConfigurable__ = true

  // These are expected to be overridden:
  // 1. By the defaults when the class is registered.
  // 2. By a subclass when a namespace with a new config is created.
  /* @ignore */
  static __config__  
  /* @ignore */
  static __namespace__ 
  /* @ignore */
  static __configId__ 

  /**
   * The configuration of the namespace this class belongs to.
   * 
   * This will be either:
   * - The `defaultConfig` passed to the `NamespaceTemplate` constructor (if using the raw class).
   * - The `config` value passed to `myNamespaceTemplate.createConfiguration` (if using the class under a configured namespace)
   * @type {any}
   */
  static get config() {
    return this.__config__ || _throwUnregisteredError(this)
  }

  /**
   * The internal namespace that includes all other configurable classes.
   * 
   * **NOTE:** To obtain the version of a class that shares the configuration of `this`, you *must* use `this._.MyClass` to access the class instead of just `MyClass`.
   * @type {Object}
   */
  static get _() {
    return this.__namespace__ || _throwUnregisteredError(this)
  }

  /**
   * The identifier of the configured namespace that this class belongs to. If this class is accessed in its raw form as opposed to under a namespace, this will be `'default'`.
   * @type {string}
   */
  static get configId() {
    return this.__configId__ || _throwUnregisteredError(this)
  }

  /**
   * The configuration of the namespace this class belongs to.
   * 
   * This will be either:
   * - The `defaultConfig` passed to the `NamespaceTemplate` constructor (if using the raw class).
   * - The `config` value passed to `myNamespaceTemplate.createConfiguration` (if using the class under a configured namespace)
   * @type {any}
   */
  get config() { return this.constructor.config }

  /**
   * The internal namespace that includes all other configurable classes.
   * 
   * **NOTE:** To obtain the version of a class that shares the configuration of `this`, you *must* use `this._.MyClass` to access the class instead of just `MyClass`.
   * @type {Object}
   */
  get _() { return this.constructor._ }

  /**
   * The identifier of the configured namespace that this class belongs to. If this class is accessed in its raw form as opposed to under a namespace, this will be `'default'`.
   * @type {string}
   */
  get configId() { return this.constructor.configId }
}

function _assertPlainObject(obj, name) {
  if (obj.constructor != ({}).constructor) {
    throw new Error(`Expected a plain object for '${name}', given '${obj.constructor.name}' instead.`)
  }
}

class NamespaceTemplate {
  /**
   * A class used for generating namespaces where all classes share a config.
   * 
   * @param {any} defaultConfig The default value to use as the `config` property when the class is accessed in its raw form and not under a namespace.
   * @param {Object} publicClasses An object containing all the public classes or objects that should be exposed as part of the namespace.
   * @param {Object} internals An object containing **all** class that require any special `stache` properties. Configured versions of these classes will be available through the `_` property of the configured classes.
   * 
   * @example
   * // Registration
   * class MyPublicClass extends stache.Configurable {};
   * class MyInternalClass extends stache.Configurable {};
   * const defaultConfig = { myProp: 'default' };
   * const template = new stache.NamespaceTemplate(defaultConfig, { MyPublicClass }, { MyInternalClass });
   * // Usage
   * const ns1 = template.createConfiguration({ myProp: 'value1' })
   * const configuredCls = new ns1.MyPublicClass();
   * console.log(configuredCls.config);  // { myProp: 'value1' }
   * console.log(configuredCls._);  // { MyInternalClass: ... }
   */
  constructor(defaultConfig, publicClasses, internals = {}) {
    _assertPlainObject(publicClasses, 'publicClasses');
    _assertPlainObject(internals, 'internals');
    this.defaultConfig = defaultConfig;
    this.public = publicClasses;
    this.internals = internals;
    this.allClasses = { ...this.public, ...this.internals };
    this._addDefaultsToClasses();
  }

  _addDefaultsToClasses() {
    // Set default config for each class so that the config is still accessible
    // Outside a configured namespace.
    for (const Class of Object.values(this.allClasses)) {
      if (_mightBeClass(Class)) {
        if (!Class.__isConfigurable__) {
          makeConfigurable(Class);
        }
        Class.__config__ = this.defaultConfig;
        Class.__namespace__ = this.allClasses;
        Class.__configId__ = 'default';
      }
    }
  }

  _createConfiguredSubclass(Class, config, configId, fullConfiguredNamespace) {
    if (_mightBeClass(Class)) {
      let SubClass;
      if (Class.toString().startsWith("class")) {
        // ES6 classes.
        SubClass = class _Configured extends Class { };
      } else {
        // Functions, which *may* be old-style classes.
        SubClass = function _Configured(...args) {
          return Class.call(this, ...args)
        };
      }
      // Add back getters to make sure they're copied over.
      _makeConfigurable(SubClass, true, true);

      // These static properties are used to populate (config, _, configId) 
      // On both the instance and the class.
      SubClass.__config__ = config;
      SubClass.__namespace__ = fullConfiguredNamespace;
      SubClass.__configId__ = configId;
      return SubClass
    } 
      // In case the argument is not an extendable class.
      return Class
  }

  /**
   * Generate a namespace where each class's `config` property is set to the passed `config` value.
   * 
   * @param {any} config The configuration to store in the namespace. 
   * @param {string | undefined} configId The identifier to set for the configuration. This will be available on each class's `configId` property. If not set, this will be a random UUID.
   * @returns {Object} A namespace (object) containing all public classes that were passed in the constructor to `NamespaceTemplate`. Each will have a `config` value equal to the first argument to this function.
   * 
   * @example
   * // Registration
   * class MyPublicClass extends stache.Configurable {};
   * class MyInternalClass extends stache.Configurable {};
   * const defaultConfig = { myProp: 'default' };
   * const template = new stache.NamespaceTemplate(defaultConfig, { MyPublicClass }, { MyInternalClass });
   * // Usage
   * const ns1 = template.createConfiguration({ myProp: 'value1' })
   * const configuredCls = new ns1.MyPublicClass();
   * console.log(configuredCls.config);  // { myProp: 'value1' }
   * console.log(configuredCls._);  // { MyInternalClass: ... }
   */
  createConfiguration(config, configId = undefined) {
    const template = this;
    configId = configId || crypto.randomUUID();
    // This is a function only because addScopeHandler and fullNamespace each
    // Rely on each other.
    const getConfiguredNamespace = () => fullNamespace,

    // Proxy handler that rescopes every public class.
    addScopeHandler = {
      get(target, prop, _receiver) {  // eslint-disable-line no-unused-vars
        const MaybeClass = target[prop];
        return template._createConfiguredSubclass(MaybeClass, config, configId, getConfiguredNamespace())
      }
    },
    publicNamespace = new Proxy(this.public, addScopeHandler),
    fullNamespace = new Proxy(this.allClasses, addScopeHandler);
    return publicNamespace
  }
}


/**
 * Register the default config for the namespace and return a function `withConfig` that can be used for generating new configured namespaces.
 * 
 * @param {any} defaultConfig The default value to use as the `config` property when the class is accessed in its raw form and not under a namespace.
 * @param {Object} publicClasses An object containing all the public classes or objects that should be exposed as part of the namespace.
 * @param {Object} internals An object containing **all** class that require any special `stache` properties. Configured versions of these classes will be available through the `_` property of the configured classes.
 * 
 * @returns A function `withConfig(config: Object, configId: string | undefined) -> Object` that creates a namespace where each class has the given `config` and optional `configId`. 
 * @example
 * // Registration
 * class MyPublicClass extends stache.Configurable {};
 * class MyInternalClass extends stache.Configurable {};
 * const defaultConfig = { myProp: 'default' };
 * const withConfig = registerAndCreateFactoryFn(defaultConfig, { MyPublicClass }, { MyInternalClass });
 * // Usage
 * const ns1 = withConfig({ myProp: 'value1' });
 * const configuredCls = new ns1.MyPublicClass();
 * console.log(configuredCls.config);  // { myProp: 'value1' }
 * console.log(configuredCls._);  // { MyInternalClass: ... }
 */
function registerAndCreateFactoryFn(defaultConfig, publicClasses, internals = {}) {
  const namespaceTemplate = new NamespaceTemplate(defaultConfig, publicClasses, internals);

  /**
   * Generate a namespace where each class's `config` property is set to the passed `config` value.
   * 
   * @param {any} config The configuration to store in the namespace. 
   * @param {string | undefined} configId The identifier to set for the configuration. This will be available on each class's `configId` property. If not set, this will be a random UUID.
   * @returns {Object} A namespace (object) containing all public classes that were passed to `registerAndCreateFactoryFn`. Each will have a `config` value equal to the first argument to this function.
   * 
   * @example
   * // Registration
   * class MyPublicClass extends stache.Configurable {};
   * class MyInternalClass extends stache.Configurable {};
   * const defaultConfig = { myProp: 'default' };
   * const withConfig = registerAndCreateFactoryFn(defaultConfig, { MyPublicClass }, { MyInternalClass });
   * // Usage
   * const ns1 = withConfig({ myProp: 'value1' });
   * const configuredCls = new ns1.MyPublicClass();
   * console.log(configuredCls.config);  // { myProp: 'value1' }
   * console.log(configuredCls._);  // { MyInternalClass: ... }
   */
  return function withConfig(config, configId = undefined) {
    return namespaceTemplate.createConfiguration(config, configId)
  }
}

var main$1 = {
  makeConfigurable,
  Configurable,
  NamespaceTemplate,
  registerAndCreateFactoryFn
};

var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet$7 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseEvent_defaultIgnored;
class BaseEvent extends ToStringAndUUID {
    constructor() {
        super(...arguments);
        this._isLocal = false;
        _BaseEvent_defaultIgnored.set(this, false);
    }
    ignoreDefault() {
        __classPrivateFieldSet(this, _BaseEvent_defaultIgnored, true, "f");
    }
    defaultIsIgnored() {
        return __classPrivateFieldGet$7(this, _BaseEvent_defaultIgnored, "f");
    }
}
_BaseEvent_defaultIgnored = new WeakMap();
class BypassEvent extends BaseEvent {
    constructor(shouldBypass) {
        super();
        this.shouldBypass = shouldBypass;
        this._isLocal = true;
    }
}
class MuteEvent extends BaseEvent {
    constructor(shouldMute) {
        super();
        this.shouldMute = shouldMute;
        this._isLocal = true;
    }
}
var KeyEventType;
(function (KeyEventType) {
    KeyEventType["KEY_DOWN"] = "keydown";
    KeyEventType["KEY_UP"] = "keyup";
})(KeyEventType || (KeyEventType = {}));
class KeyEvent extends BaseEvent {
    constructor(eventType, eventPitch = 64, eventVelocity = 64, key) {
        super();
        this.eventType = eventType;
        this.eventPitch = eventPitch;
        this.eventVelocity = eventVelocity;
        this.key = key !== null && key !== void 0 ? key : eventPitch;
    }
}

var events = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BaseEvent: BaseEvent,
    BypassEvent: BypassEvent,
    KeyEvent: KeyEvent,
    get KeyEventType () { return KeyEventType; },
    MuteEvent: MuteEvent
});

class ADSR extends BaseComponent {
    constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
        super();
        // Inputs
        this.attackEvent = this.defineControlInput('attackEvent').ofType(Symbol);
        this.releaseEvent = this.defineControlInput('releaseEvent').ofType(Symbol);
        this.attackDurationMs = this.defineControlInput('attackDurationMs', attackDurationMs).ofType(Number);
        this.decayDurationMs = this.defineControlInput('decayDurationMs', decayDurationMs).ofType(Number);
        this.sustainAmplitude = this.defineControlInput('sustainAmplitude', sustainAmplitude).ofType(Number);
        this.releaseDurationMs = this.defineControlInput('releaseDurationMs', releaseDurationMs).ofType(Number);
        this._paramModulator = createConstantSource(this.audioContext);
        this.audioOutput = this.defineAudioOutput('audioOutput', this._paramModulator);
        this.state = { noteStart: 0, attackFinish: 0, decayFinish: 0 };
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        const state = this.state;
        if (input == this.attackEvent) {
            state.noteStart = this.now();
            this._paramModulator.offset.cancelScheduledValues(state.noteStart);
            state.attackFinish = state.noteStart + this.attackDurationMs.value / 1000;
            state.decayFinish = state.attackFinish + this.decayDurationMs.value / 1000;
            this._paramModulator.offset.setValueAtTime(0, state.noteStart);
            this._paramModulator.offset.linearRampToValueAtTime(1.0, state.attackFinish);
            // Starts *after* the previous event finishes.
            this._paramModulator.offset.linearRampToValueAtTime(this.sustainAmplitude.value, state.decayFinish);
            this._paramModulator.offset.setValueAtTime(this.sustainAmplitude.value, state.decayFinish);
        }
        else if (input == this.releaseEvent) {
            const releaseStart = this.now();
            let releaseFinish;
            if (releaseStart > state.attackFinish && releaseStart < state.decayFinish) {
                // Special case: the amplitude is in the middle of increasing. If we 
                // immediately release, we risk the note being louder *longer* than if 
                // it was allowed to decay, in the case that the release is longer than 
                // the decay and sustain < 1. So, let it decay, then release.
                releaseFinish = state.decayFinish + this.releaseDurationMs.value / 1000;
            }
            else {
                // Immediately release.
                this._paramModulator.offset.cancelScheduledValues(releaseStart);
                this._paramModulator.offset.setValueAtTime(this._paramModulator.offset.value, releaseStart);
                releaseFinish = releaseStart + this.releaseDurationMs.value / 1000;
            }
            this._paramModulator.offset.linearRampToValueAtTime(0.0, releaseFinish);
        }
    }
}

class AudioComponent extends BaseComponent {
    constructor(inputNode) {
        super();
        this.input = this.defineAudioInput('input', inputNode);
        if (inputNode instanceof AudioNode) {
            this.output = this.defineAudioOutput('output', inputNode);
        }
        else if (!(inputNode instanceof AudioParam)) {
            throw new Error("AudioComponents must be built from either and AudioNode or AudioParam");
        }
        this.preventIOOverwrites();
    }
}

const RECORDER_WORKLET_NAME = "recorder-worklet";

class AudioRecordingComponent extends BaseComponent {
    constructor(numberOfInputs = 1) {
        super();
        this.isRecording = false;
        // Methods to be called when receiving a message from the worklet.
        this.onMessage = () => null;
        this.onFailure = () => null;
        this.worklet = new AudioWorkletNode(this.audioContext, RECORDER_WORKLET_NAME, {
            numberOfInputs,
            numberOfOutputs: 0,
        });
        this.worklet.port.onmessage = event => {
            this.handleMessage(event.data);
        };
        for (const i of range(numberOfInputs)) {
            const gain = this.audioContext.createGain();
            gain.connect(this.worklet, undefined, i);
            this[i] = this.defineAudioInput(i, gain);
        }
    }
    capture(numSamples) {
        if (this.isRecording) {
            throw new Error("Audio is already being recorded.");
        }
        this.worklet.port.postMessage({ command: 'start', numSamples });
        this.isRecording = true;
        return this.waitForWorkletResponse();
    }
    start() {
        if (this.isRecording) {
            throw new Error("Audio is already being recorded.");
        }
        this.worklet.port.postMessage({ command: 'start' });
        this.isRecording = true;
    }
    stop() {
        if (!this.isRecording) {
            throw new Error("start() must be called before calling stop().");
        }
        this.worklet.port.postMessage({ command: 'stop' });
        return this.waitForWorkletResponse();
    }
    waitForWorkletResponse() {
        // This promise will resolve when the 'message' event listener calls one
        // of these methods.
        return new Promise((res, rej) => {
            this.onMessage = res;
            this.onFailure = rej;
        });
    }
    handleMessage(floatData) {
        if (!this.isRecording) {
            console.warn("Received a response from the worklet while recording was not enabled.");
        }
        this.isRecording = false;
        if (!(floatData instanceof Array && floatData.length > 0)) {
            this.onFailure();
        }
        else {
            const numSamples = floatData[0][0].length;
            const audioBuffers = floatData.map(input => {
                const audioBuffer = new AudioBuffer({
                    numberOfChannels: input.length,
                    length: numSamples, sampleRate: this.audioContext.sampleRate
                });
                input.map((channel, i) => audioBuffer.copyToChannel(channel, i));
                return audioBuffer;
            });
            this.onMessage(audioBuffers);
        }
    }
}

// This file was generated. Do not modify manually!
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 81, 2, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 9, 5351, 0, 7, 14, 13835, 9, 87, 9, 39, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4706, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 983, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

// This file was generated. Do not modify manually!
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 68, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 4026, 582, 8634, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 757, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];

// This file was generated. Do not modify manually!
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0898-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

// This file was generated. Do not modify manually!
var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ca\ua7d0\ua7d1\ua7d3\ua7d5-\ua7d9\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range.

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};

var keywordRelationalOperator = /^in(stanceof)?$/;

// ## Character categories

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) { return false }
    pos += set[i + 1];
    if (pos >= code) { return true }
  }
  return false
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) { return code === 36 }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) { return code === 36 }
  if (code < 58) { return true }
  if (code < 65) { return false }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

// Map keyword names to token types.

var keywords = {};

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name;
  return keywords[name] = new TokenType(name, options)
}

var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),
  coalesce: binop("??", 1),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
};

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

function nextLineBreak(code, from, end) {
  if ( end === void 0 ) end = code.length;

  for (var i = from; i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next))
      { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
  }
  return -1
}

var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;

var hasOwn = Object.hasOwn || (function (obj, propName) { return (
  hasOwnProperty.call(obj, propName)
); });

var isArray = Array.isArray || (function (obj) { return (
  toString.call(obj) === "[object Array]"
); });

var regexpCache = Object.create(null);

function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
}

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) { return String.fromCharCode(code) }
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) { this.source = p.sourceFile; }
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    var nextBreak = nextLineBreak(input, cur, offset);
    if (nextBreak < 0) { return new Position(line, offset - cur) }
    ++line;
    cur = nextBreak;
  }
}

// A second argument must be given to configure the parser process.
// These options are recognized (only `ecmaVersion` is required):

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  // (the latest version the library supports). This influences
  // support for strict mode, the set of reserved words, and support
  // for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called when
  // a semicolon is automatically inserted. It will be passed the
  // position of the inserted semicolon as an offset, and if
  // `locations` is enabled, it is given the location as a `{line,
  // column}` object as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: null,
  // When enabled, super identifiers are not constrained to
  // appearing in methods and do not raise an error when they appear elsewhere.
  allowSuperOutsideMethod: null,
  // When enabled, hashbang directive in the beginning of file is
  // allowed and treated as a line comment. Enabled by default when
  // `ecmaVersion` >= 2023.
  allowHashBang: false,
  // By default, the parser will verify that private properties are
  // only used in places where they are valid and have been declared.
  // Set this to false to turn such checks off.
  checkPrivateFields: true,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  // When this option has an array as value, objects representing the
  // comments are pushed to it.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
};

// Interpret and default an options object

var warnedAboutEcmaVersion = false;

function getOptions(opts) {
  var options = {};

  for (var opt in defaultOptions)
    { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }

  if (options.allowReserved == null)
    { options.allowReserved = options.ecmaVersion < 5; }

  if (!opts || opts.allowHashBang == null)
    { options.allowHashBang = options.ecmaVersion >= 14; }

  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function (token) { return tokens.push(token); };
  }
  if (isArray(options.onComment))
    { options.onComment = pushComment(options, options.onComment); }

  return options
}

function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations)
      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
    if (options.ranges)
      { comment.range = [start, end]; }
    array.push(comment);
  }
}

// Each scope gets a bitset that may contain these flags
var
    SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128,
    SCOPE_CLASS_STATIC_BLOCK = 256,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
}

// Used in checkLVal* and declareName to determine the type of a binding
var
    BIND_NONE = 0, // Not a binding
    BIND_VAR = 1, // Var-style binding
    BIND_LEXICAL = 2, // Let- or const-style binding
    BIND_FUNCTION = 3, // Function declaration
    BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
    BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") { reserved += " await"; }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false;

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = types$1.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition();

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;

  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  // Labels in scope.
  this.labels = [];
  // Thus-far undefined exports.
  this.undefinedExports = Object.create(null);

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
    { this.skipLineComment(2); }

  // Scope tracking for duplicate variable names (see scope.js)
  this.scopeStack = [];
  this.enterScope(SCOPE_TOP);

  // For RegExp validation
  this.regexpState = null;

  // The stack of private names.
  // Each element has two properties: 'declared' and 'used'.
  // When it exited from the outermost class definition, all used private names must be declared.
  this.privateNameStack = [];
};

var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node)
};

prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 && !this.currentVarScope().inClassFieldInit };

prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 && !this.currentVarScope().inClassFieldInit };

prototypeAccessors.canAwait.get = function () {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var scope = this.scopeStack[i];
    if (scope.inClassFieldInit || scope.flags & SCOPE_CLASS_STATIC_BLOCK) { return false }
    if (scope.flags & SCOPE_FUNCTION) { return (scope.flags & SCOPE_ASYNC) > 0 }
  }
  return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
};

prototypeAccessors.allowSuper.get = function () {
  var ref = this.currentThisScope();
    var flags = ref.flags;
    var inClassFieldInit = ref.inClassFieldInit;
  return (flags & SCOPE_SUPER) > 0 || inClassFieldInit || this.options.allowSuperOutsideMethod
};

prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

prototypeAccessors.allowNewDotTarget.get = function () {
  var ref = this.currentThisScope();
    var flags = ref.flags;
    var inClassFieldInit = ref.inClassFieldInit;
  return (flags & (SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK)) > 0 || inClassFieldInit
};

prototypeAccessors.inClassStaticBlock.get = function () {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
};

Parser.extend = function extend () {
    var plugins = [], len = arguments.length;
    while ( len-- ) plugins[ len ] = arguments[ len ];

  var cls = this;
  for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
  return cls
};

Parser.parse = function parse (input, options) {
  return new this(options, input).parse()
};

Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression()
};

Parser.tokenizer = function tokenizer (input, options) {
  return new this(options, input)
};

Object.defineProperties( Parser.prototype, prototypeAccessors );

var pp$9 = Parser.prototype;

// ## Parser utilities

var literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/s;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) { return false }
  for (;;) {
    // Try to find string literal.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) { return false }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" ||
        (lineBreak.test(spaceAfter[0]) &&
         !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
    }
    start += match[0].length;

    // Skip semicolon, if any.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";")
      { start++; }
  }
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

// Tests whether parsed token is a contextual keyword.

pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc
};

// Consumes contextual keyword if possible.

pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) { return false }
  this.next();
  return true
};

// Asserts that following token is given contextual keyword.

pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) { this.unexpected(); }
};

// Test whether a semicolon can be inserted at the current position.

pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof ||
    this.type === types$1.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
    return true
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
};

pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma)
      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
    if (!notNext)
      { this.next(); }
    return true
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

var DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign =
  this.trailingComma =
  this.parenthesizedAssign =
  this.parenthesizedBind =
  this.doubleProto =
    -1;
};

pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) { return }
  if (refDestructuringErrors.trailingComma > -1)
    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
};

pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) { return false }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  if (shorthandAssign >= 0)
    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  if (doubleProto >= 0)
    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
};

pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  if (this.awaitPos)
    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
};

pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    { return this.isSimpleAssignTarget(expr.expression) }
  return expr.type === "Identifier" || expr.type === "MemberExpression"
};

var pp$8 = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$8.parseTopLevel = function(node) {
  var exports = Object.create(null);
  if (!node.body) { node.body = []; }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports);
    node.body.push(stmt);
  }
  if (this.inModule)
    { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
      {
        var name = list[i];

        this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
      } }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType;
  return this.finishNode(node, "Program")
};

var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  // For ambiguous cases, determine if a LexicalDeclaration (or only a
  // Statement) is allowed here. If context is not empty then only a Statement
  // is allowed. However, `let [` is an explicit negative lookahead for
  // ExpressionStatement, so special-case it first.
  if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
  if (context) { return false }

  if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
    if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) { return true }
  }
  return false
};

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 === this.input.length ||
     !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$8.parseStatement = function(context, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;

  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case types$1._debugger: return this.parseDebuggerStatement(node)
  case types$1._do: return this.parseDoStatement(node)
  case types$1._for: return this.parseForStatement(node)
  case types$1._function:
    // Function as sole body of either an if statement or a labeled statement
    // works, but not when it is part of a labeled statement that is the sole
    // body of an if statement.
    if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
    return this.parseFunctionStatement(node, false, !context)
  case types$1._class:
    if (context) { this.unexpected(); }
    return this.parseClass(node, true)
  case types$1._if: return this.parseIfStatement(node)
  case types$1._return: return this.parseReturnStatement(node)
  case types$1._switch: return this.parseSwitchStatement(node)
  case types$1._throw: return this.parseThrowStatement(node)
  case types$1._try: return this.parseTryStatement(node)
  case types$1._const: case types$1._var:
    kind = kind || this.value;
    if (context && kind !== "var") { this.unexpected(); }
    return this.parseVarStatement(node, kind)
  case types$1._while: return this.parseWhileStatement(node)
  case types$1._with: return this.parseWithStatement(node)
  case types$1.braceL: return this.parseBlock(true, node)
  case types$1.semi: return this.parseEmptyStatement(node)
  case types$1._export:
  case types$1._import:
    if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
      skipWhiteSpace.lastIndex = this.pos;
      var skip = skipWhiteSpace.exec(this.input);
      var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
      if (nextCh === 40 || nextCh === 46) // '(' or '.'
        { return this.parseExpressionStatement(node, this.parseExpression()) }
    }

    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
      if (!this.inModule)
        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
    }
    return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (context) { this.unexpected(); }
      this.next();
      return this.parseFunctionStatement(node, true, !context)
    }

    var maybeName = this.value, expr = this.parseExpression();
    if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
      { return this.parseLabeledStatement(node, maybeName, expr, context) }
    else { return this.parseExpressionStatement(node, expr) }
  }
};

pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
  else if (this.type !== types$1.name) { this.unexpected(); }
  else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
      if (node.label && isBreak) { break }
    }
  }
  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
};

pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement")
};

pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6)
    { this.eat(types$1.semi); }
  else
    { this.semicolon(); }
  return this.finishNode(node, "DoWhileStatement")
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, null)
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types$1._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      return this.parseForIn(node, init$1)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init$1)
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors;
  var initPos = this.start;
  var init = awaitAt > -1
    ? this.parseExprSubscripts(refDestructuringErrors, "await")
    : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
      if (this.type === types$1._in) { this.unexpected(awaitAt); }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
      else if (this.options.ecmaVersion >= 9) { node.await = false; }
    }
    if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
};

pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement")
};

pp$8.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    { this.raise(this.start, "'return' outside of function"); }
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
  else { node.argument = this.parseExpression(); this.semicolon(); }
  return this.finishNode(node, "ReturnStatement")
};

pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(0);

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;
  for (var sawDefault = false; this.type !== types$1.braceR;) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) { this.finishNode(cur, "SwitchCase"); }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) { this.unexpected(); }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) { this.finishNode(cur, "SwitchCase"); }
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement")
};

pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement")
};

// Reused empty array added for node fields that are always empty.

var empty$1 = [];

pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);

  return param
};

pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) { this.unexpected(); }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer)
    { this.raise(node.start, "Missing catch or finally clause"); }
  return this.finishNode(node, "TryStatement")
};

pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration")
};

pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement")
};

pp$8.parseWithStatement = function(node) {
  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement")
};

pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement")
};

pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
    {
    var label = list[i$1];

    if (label.name === maybeName)
      { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  } }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this.labels[i];
    if (label$1.statementStart === node.start) {
      // Update information about previous labels on this node
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else { break }
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement")
};

pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement")
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
  if ( node === void 0 ) node = this.startNode();

  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) { this.enterScope(0); }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) { this.strict = false; }
  this.next();
  if (createNewLexicalScope) { this.exitScope(); }
  return this.finishNode(node, "BlockStatement")
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement")
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();

  if (
    init.type === "VariableDeclaration" &&
    init.declarations[0].init != null &&
    (
      !isForIn ||
      this.options.ecmaVersion < 8 ||
      this.strict ||
      init.kind !== "var" ||
      init.declarations[0].id.type !== "Identifier"
    )
  ) {
    this.raise(
      init.start,
      ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
    );
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
};

// Parse a list of variable declarations.

pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
      this.unexpected();
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) { break }
  }
  return node
};

pp$8.parseVarId = function(decl, kind) {
  decl.id = this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};

var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

// Parse a function declaration or literal (depending on the
// `statement & FUNC_STATEMENT`).

// Remove `allowExpressionBody` for 7.0.0, as it is only called with false
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
      { this.unexpected(); }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  if (statement & FUNC_STATEMENT) {
    node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT))
      // If it is a regular function declaration in sloppy mode, then it is
      // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
      // mode depends on properties of the current scope (see
      // treatFunctionsAsVar).
      { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
  }

  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));

  if (!(statement & FUNC_STATEMENT))
    { node.id = this.type === types$1.name ? this.parseIdent() : null; }

  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
};

pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$8.parseClass = function(node, isStatement) {
  this.next();

  // ecma-262 14.6 Class Definitions
  // A class definition is always strict mode code.
  var oldStrict = this.strict;
  this.strict = true;

  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) { return null }

  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;

  if (this.eatContextual("static")) {
    // Parse static init block
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }

  // Parse element name
  if (keyName) {
    // 'async', 'get', 'set', or 'static' were not a keyword contextually.
    // The last token is any of those. Make it the element name.
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }

  // Parse element value
  if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
    if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }

  return node
};

pp$8.isClassElementNameStart = function() {
  return (
    this.type === types$1.name ||
    this.type === types$1.privateId ||
    this.type === types$1.num ||
    this.type === types$1.string ||
    this.type === types$1.bracketL ||
    this.type.keyword
  )
};

pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};

pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  // Check key and flags
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }

  // Parse value
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

  // Check value
  if (method.kind === "get" && value.params.length !== 0)
    { this.raiseRecoverable(value.start, "getter should have no params"); }
  if (method.kind === "set" && value.params.length !== 1)
    { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
  if (method.kind === "set" && value.params[0].type === "RestElement")
    { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

  return this.finishNode(method, "MethodDefinition")
};

pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }

  if (this.eat(types$1.eq)) {
    // To raise SyntaxError if 'arguments' exists in the initializer.
    var scope = this.currentThisScope();
    var inClassFieldInit = scope.inClassFieldInit;
    scope.inClassFieldInit = true;
    field.value = this.parseMaybeAssign();
    scope.inClassFieldInit = inClassFieldInit;
  } else {
    field.value = null;
  }
  this.semicolon();

  return this.finishNode(field, "PropertyDefinition")
};

pp$8.parseClassStaticBlock = function(node) {
  node.body = [];

  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;

  return this.finishNode(node, "StaticBlock")
};

pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement)
      { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
  } else {
    if (isStatement === true)
      { this.unexpected(); }
    node.id = null;
  }
};

pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};

pp$8.enterClassBody = function() {
  var element = {declared: Object.create(null), used: []};
  this.privateNameStack.push(element);
  return element.declared
};

pp$8.exitClassBody = function() {
  var ref = this.privateNameStack.pop();
  var declared = ref.declared;
  var used = ref.used;
  if (!this.options.checkPrivateFields) { return }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i = 0; i < used.length; ++i) {
    var id = used[i];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
      }
    }
  }
};

function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];

  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }

  // `class { get #a(){}; static set #a(_){} }` is also conflict.
  if (
    curr === "iget" && next === "iset" ||
    curr === "iset" && next === "iget" ||
    curr === "sget" && next === "sset" ||
    curr === "sset" && next === "sget"
  ) {
    privateNameMap[name] = "true";
    return false
  } else if (!curr) {
    privateNameMap[name] = next;
    return false
  } else {
    return true
  }
}

function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (
    key.type === "Identifier" && key.name === name ||
    key.type === "Literal" && key.value === name
  )
}

// Parses module export declaration.

pp$8.parseExportAllDeclaration = function(node, exports) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) { this.unexpected(); }
  node.source = this.parseExprAtom();
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration")
};

pp$8.parseExport = function(node, exports) {
  this.next();
  // export * from '...'
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports)
  }
  if (this.eat(types$1._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration")
      { this.checkVariableExport(exports, node.declaration.declarations); }
    else
      { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
    node.specifiers = [];
    node.source = null;
  } else { // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
    } else {
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        // check for keywords used as local names
        var spec = list[i];

        this.checkUnreserved(spec.local);
        // check if export is defined
        this.checkLocalExport(spec.local);

        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null)
};

pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) { this.next(); }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID")
  } else {
    var declaration = this.parseMaybeAssign();
    this.semicolon();
    return declaration
  }
};

pp$8.checkExport = function(exports, name, pos) {
  if (!exports) { return }
  if (typeof name !== "string")
    { name = name.type === "Identifier" ? name.name : name.value; }
  if (hasOwn(exports, name))
    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  exports[name] = true;
};

pp$8.checkPatternExport = function(exports, pat) {
  var type = pat.type;
  if (type === "Identifier")
    { this.checkExport(exports, pat, pat.start); }
  else if (type === "ObjectPattern")
    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
      {
        var prop = list[i];

        this.checkPatternExport(exports, prop);
      } }
  else if (type === "ArrayPattern")
    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];

        if (elt) { this.checkPatternExport(exports, elt); }
    } }
  else if (type === "Property")
    { this.checkPatternExport(exports, pat.value); }
  else if (type === "AssignmentPattern")
    { this.checkPatternExport(exports, pat.left); }
  else if (type === "RestElement")
    { this.checkPatternExport(exports, pat.argument); }
};

pp$8.checkVariableExport = function(exports, decls) {
  if (!exports) { return }
  for (var i = 0, list = decls; i < list.length; i += 1)
    {
    var decl = list[i];

    this.checkPatternExport(exports, decl.id);
  }
};

pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
};

// Parses a comma-separated list of module exports.

pp$8.parseExportSpecifier = function(exports) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();

  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(
    exports,
    node.exported,
    node.exported.start
  );

  return this.finishNode(node, "ExportSpecifier")
};

pp$8.parseExportSpecifiers = function(exports) {
  var nodes = [], first = true;
  // export { x, y as z } [from '...']
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    nodes.push(this.parseExportSpecifier(exports));
  }
  return nodes
};

// Parses import declaration.

pp$8.parseImport = function(node) {
  this.next();

  // import '...'
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

// Parses a comma-separated list of module imports.

pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();

  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);

  return this.finishNode(node, "ImportSpecifier")
};

pp$8.parseImportDefaultSpecifier = function() {
  // import defaultObj, { x, y as z } from '...'
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier")
};

pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier")
};

pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) { return nodes }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    nodes.push(this.parseImportSpecifier());
  }
  return nodes
};

pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral
  }
  return this.parseIdent(true)
};

// Set `ExpressionStatement#directive` property for directive prologues.
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return (
    this.options.ecmaVersion >= 5 &&
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
};

var pp$7 = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
      if (this.inAsync && node.name === "await")
        { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
      break

    case "ObjectPattern":
    case "ArrayPattern":
    case "AssignmentPattern":
    case "RestElement":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.toAssignable(prop, isBinding);
        // Early error:
        //   AssignmentRestProperty[Yield, Await] :
        //     `...` DestructuringAssignmentTarget[Yield, Await]
        //
        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
        if (
          prop.type === "RestElement" &&
          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
        ) {
          this.raise(prop.argument.start, "Unexpected token");
        }
      }
      break

    case "Property":
      // AssignmentProperty has type === "Property"
      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
      this.toAssignable(node.value, isBinding);
      break

    case "ArrayExpression":
      node.type = "ArrayPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      this.toAssignableList(node.elements, isBinding);
      break

    case "SpreadElement":
      node.type = "RestElement";
      this.toAssignable(node.argument, isBinding);
      if (node.argument.type === "AssignmentPattern")
        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
      break

    case "AssignmentExpression":
      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
      node.type = "AssignmentPattern";
      delete node.operator;
      this.toAssignable(node.left, isBinding);
      break

    case "ParenthesizedExpression":
      this.toAssignable(node.expression, isBinding, refDestructuringErrors);
      break

    case "ChainExpression":
      this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (!isBinding) { break }

    default:
      this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  return node
};

// Convert list of expression atoms to binding list.

pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) { this.toAssignable(elt, isBinding); }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      { this.unexpected(last.argument.start); }
  }
  return exprList
};

// Parses spread element.

pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement")
};

pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
    { this.unexpected(); }

  node.argument = this.parseBindingAtom();

  return this.finishNode(node, "RestElement")
};

// Parses lvalue (assignable) atom.

pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
    case types$1.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(types$1.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case types$1.braceL:
      return this.parseObj(true)
    }
  }
  return this.parseIdent()
};

pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) { first = false; }
    else { this.expect(types$1.comma); }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
      this.expect(close);
      break
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts
};

pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem
};

pp$7.parseBindingListItem = function(param) {
  return param
};

// Parses assignment pattern around given atom if possible.

pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern")
};

// The following three functions all verify that a node is an lvalue —
// something that can be bound, or assigned to. In order to do so, they perform
// a variety of checks:
//
// - Check that none of the bound/assigned-to identifiers are reserved words.
// - Record name declarations for bindings in the appropriate scope.
// - Check duplicate argument names, if checkClashes is set.
//
// If a complex binding pattern is encountered (e.g., object and array
// destructuring), the entire pattern is recursively checked.
//
// There are three versions of checkLVal*() appropriate for different
// circumstances:
//
// - checkLValSimple() shall be used if the syntactic construct supports
//   nothing other than identifiers and member expressions. Parenthesized
//   expressions are also correctly handled. This is generally appropriate for
//   constructs for which the spec says
//
//   > It is a Syntax Error if AssignmentTargetType of [the production] is not
//   > simple.
//
//   It is also appropriate for checking if an identifier is valid and not
//   defined elsewhere, like import declarations or function/class identifiers.
//
//   Examples where this is used include:
//     a += …;
//     import a from '…';
//   where a is the node to be checked.
//
// - checkLValPattern() shall be used if the syntactic construct supports
//   anything checkLValSimple() supports, as well as object and array
//   destructuring patterns. This is generally appropriate for constructs for
//   which the spec says
//
//   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
//   > an ArrayLiteral and AssignmentTargetType of [the production] is not
//   > simple.
//
//   Examples where this is used include:
//     (a = …);
//     const a = …;
//     try { … } catch (a) { … }
//   where a is the node to be checked.
//
// - checkLValInnerPattern() shall be used if the syntactic construct supports
//   anything checkLValPattern() supports, as well as default assignment
//   patterns, rest elements, and other constructs that may appear within an
//   object or array destructuring pattern.
//
//   As a special case, function parameters also use checkLValInnerPattern(),
//   as they also support defaults and rest constructs.
//
// These functions deliberately support both assignment and binding constructs,
// as the logic for both is exceedingly similar. If the node is the target of
// an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
// should be set to the appropriate BIND_* constant, like BIND_VAR or
// BIND_LEXICAL.
//
// If the function is called with a non-BIND_NONE bindingType, then
// additionally a checkClashes object may be specified to allow checking for
// duplicate argument names. checkClashes is ignored if the provided construct
// is an assignment (i.e., bindingType is BIND_NONE).

pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  var isBind = bindingType !== BIND_NONE;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
    if (isBind) {
      if (bindingType === BIND_LEXICAL && expr.name === "let")
        { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
      if (checkClashes) {
        if (hasOwn(checkClashes, expr.name))
          { this.raiseRecoverable(expr.start, "Argument name clash"); }
        checkClashes[expr.name] = true;
      }
      if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
    }
    break

  case "ChainExpression":
    this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
    break

  case "MemberExpression":
    if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
    break

  case "ParenthesizedExpression":
    if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
    return this.checkLValSimple(expr.expression, bindingType, checkClashes)

  default:
    this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};

pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  switch (expr.type) {
  case "ObjectPattern":
    for (var i = 0, list = expr.properties; i < list.length; i += 1) {
      var prop = list[i];

    this.checkLValInnerPattern(prop, bindingType, checkClashes);
    }
    break

  case "ArrayPattern":
    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
      var elem = list$1[i$1];

    if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
    }
    break

  default:
    this.checkLValSimple(expr, bindingType, checkClashes);
  }
};

pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  switch (expr.type) {
  case "Property":
    // AssignmentProperty has type === "Property"
    this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
    break

  case "AssignmentPattern":
    this.checkLValPattern(expr.left, bindingType, checkClashes);
    break

  case "RestElement":
    this.checkLValPattern(expr.argument, bindingType, checkClashes);
    break

  default:
    this.checkLValPattern(expr, bindingType, checkClashes);
  }
};

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design


var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};

var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};

var pp$6 = Parser.prototype;

pp$6.initialContext = function() {
  return [types.b_stat]
};

pp$6.curContext = function() {
  return this.context[this.context.length - 1]
};

pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat)
    { return true }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
    { return !parent.isExpr }

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
    { return true }
  if (prevType === types$1.braceL)
    { return parent === types.b_stat }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
    { return false }
  return !this.exprAllowed
};

pp$6.inGeneratorContext = function() {
  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function")
      { return context.generator }
  }
  return false
};

pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot)
    { this.exprAllowed = false; }
  else if (update = type.updateContext)
    { update.call(this, prevType); }
  else
    { this.exprAllowed = type.beforeExpr; }
};

// Used to handle edge cases when token context could not be inferred correctly during tokenization phase

pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};

// Token-specific context update code

types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};

types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};

types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};

types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};

types$1.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
};

types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else &&
      !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
      !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
      !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
    { this.context.push(types.f_expr); }
  else
    { this.context.push(types.f_stat); }
  this.exprAllowed = false;
};

types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") { this.context.pop(); }
  this.exprAllowed = true;
};

types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl)
    { this.context.pop(); }
  else
    { this.context.push(types.q_tmpl); }
  this.exprAllowed = false;
};

types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr)
      { this.context[index] = types.f_expr_gen; }
    else
      { this.context[index] = types.f_gen; }
  }
  this.exprAllowed = true;
};

types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed ||
        this.value === "yield" && this.inGeneratorContext())
      { allowed = true; }
  }
  this.exprAllowed = allowed;
};

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


var pp$5 = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    { return }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    { return }
  var key = prop.key;
  var name;
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition)
      { this.raiseRecoverable(key.start, "Redefinition of property"); }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
  if (this.type === types$1.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) { return this.parseYield(forInit) }
    // The tokenizer will assume an expression is allowed after
    // `yield`, but this isn't that kind of yield
    else { this.exprAllowed = false; }
  }

  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }

  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq)
      { left = this.toAssignable(left, false, refDestructuringErrors); }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }
    if (refDestructuringErrors.shorthandAssign >= left.start)
      { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
    if (this.type === types$1.eq)
      { this.checkLValPattern(left); }
    else
      { this.checkLValSimple(left); }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  }
  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  return left
};

// Parse a ternary conditional (`?:`) operator.

pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  if (this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

// Start the precedence parser.

pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
        // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
    }
  }
  return left
};

pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
};

// Parse unary operators, both prefix and postfix.

pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) { this.checkLValSimple(node.argument); }
    else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
    else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
      { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
    else { sawUnary = true; }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
    expr = this.parsePrivateIdent();
    // only could be private fields in 'in', such as #x in obj
    if (this.type !== types$1._in) { this.unexpected(); }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }

  if (!incDec && this.eat(types$1.starstar)) {
    if (sawUnary)
      { this.unexpected(this.lastTokStart); }
    else
      { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
  } else {
    return expr
  }
};

function isLocalVariableAccess(node) {
  return (
    node.type === "Identifier" ||
    node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
  )
}

function isPrivateFieldAccess(node) {
  return (
    node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
    node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
    node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
  )
}

// Parse call, dot, and `[]`-subscript expressions.

pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
    { return expr }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
    if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
  }
  return result
};

pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
      this.potentialArrowAt === base.start;
  var optionalChained = false;

  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

    if (element.optional) { optionalChained = true; }
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element
    }

    base = element;
  }
};

pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow)
};

pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
};

pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

  var computed = this.eat(types$1.bracketL);
  if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0)
        { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({isTagged: true});
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  // If a division operator appears in an expression position, the
  // tokenizer got confused, and we force it to read a regexp instead.
  if (this.type === types$1.slash) { this.readRegexp(); }

  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
  case types$1._super:
    if (!this.allowSuper)
      { this.raise(this.start, "'super' keyword outside a method"); }
    node = this.startNode();
    this.next();
    if (this.type === types$1.parenL && !this.allowDirectSuper)
      { this.raise(node.start, "super() call outside constructor of a subclass"); }
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super ( Arguments )
    if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
      { this.unexpected(); }
    return this.finishNode(node, "Super")

  case types$1._this:
    node = this.startNode();
    this.next();
    return this.finishNode(node, "ThisExpression")

  case types$1.name:
    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
    var id = this.parseIdent(false);
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
      this.overrideContext(types.f_expr);
      return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
    }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(types$1.arrow))
        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
          (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
        id = this.parseIdent(false);
        if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
          { this.unexpected(); }
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
      }
    }
    return id

  case types$1.regexp:
    var value = this.value;
    node = this.parseLiteral(value.value);
    node.regex = {pattern: value.pattern, flags: value.flags};
    return node

  case types$1.num: case types$1.string:
    return this.parseLiteral(this.value)

  case types$1._null: case types$1._true: case types$1._false:
    node = this.startNode();
    node.value = this.type === types$1._null ? null : this.type === types$1._true;
    node.raw = this.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types$1.parenL:
    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        { refDestructuringErrors.parenthesizedAssign = start; }
      if (refDestructuringErrors.parenthesizedBind < 0)
        { refDestructuringErrors.parenthesizedBind = start; }
    }
    return expr

  case types$1.bracketL:
    node = this.startNode();
    this.next();
    node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
    return this.finishNode(node, "ArrayExpression")

  case types$1.braceL:
    this.overrideContext(types.b_expr);
    return this.parseObj(false, refDestructuringErrors)

  case types$1._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, 0)

  case types$1._class:
    return this.parseClass(this.startNode(), false)

  case types$1._new:
    return this.parseNew()

  case types$1.backQuote:
    return this.parseTemplate()

  case types$1._import:
    if (this.options.ecmaVersion >= 11) {
      return this.parseExprImport(forNew)
    } else {
      return this.unexpected()
    }

  default:
    return this.parseExprAtomDefault()
  }
};

pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};

pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();

  // Consume `import` as an identifier for `import.meta`.
  // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
  if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
  this.next();

  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node)
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node)
  } else {
    this.unexpected();
  }
};

pp$5.parseDynamicImport = function(node) {
  this.next(); // skip `(`

  // Parse node.source.
  node.source = this.parseMaybeAssign();

  // Verify ending.
  if (!this.eat(types$1.parenR)) {
    var errorPos = this.start;
    if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
      this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
    } else {
      this.unexpected(errorPos);
    }
  }

  return this.finishNode(node, "ImportExpression")
};

pp$5.parseImportMeta = function(node) {
  this.next(); // skip `.`

  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);

  if (node.property.name !== "meta")
    { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
  if (containsEsc)
    { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
    { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

  return this.finishNode(node, "MetaProperty")
};

pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1).replace(/_/g, ""); }
  this.next();
  return this.finishNode(node, "Literal")
};

pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val
};

pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon()
};

pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    // Do not save awaitIdentPos to allow checking awaits nested in parameters
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(
            this.start,
            "Comma is not permitted after the rest element"
          );
        }
        break
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);

    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
    }

    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
    if (spreadStart) { this.unexpected(spreadStart); }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
};

pp$5.parseParenItem = function(item) {
  return item
};

pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty = [];

pp$5.parseNew = function() {
  if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
    if (!this.allowNewDotTarget)
      { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
  else { node.arguments = empty; }
  return this.finishNode(node, "NewExpression")
};

// Parse template expression.

pp$5.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;

  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, "\n"),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

pp$5.parseTemplate = function(ref) {
  if ( ref === void 0 ) ref = {};
  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({isTagged: isTagged});
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral")
};

pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

// Parse an object literal or binding pattern.

pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
};

pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement")
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern)
      { isGenerator = this.eat(types$1.star); }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property")
};

pp$5.parseGetterSetter = function(prop) {
  prop.kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get")
      { this.raiseRecoverable(start, "getter should have no params"); }
    else
      { this.raiseRecoverable(start, "setter should have exactly one param"); }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
      { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
  }
};

pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon)
    { this.unexpected(); }

  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) { this.unexpected(); }
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) { this.unexpected(); }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) { this.unexpected(); }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos)
      { this.awaitIdentPos = startPos; }
    prop.kind = "init";
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        { refDestructuringErrors.shorthandAssign = this.start; }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.shorthand = true;
  } else { this.unexpected(); }
};

pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
};

// Initialize empty function node.

pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
  if (this.options.ecmaVersion >= 8) { node.async = false; }
};

// Parse object or class method.

pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression")
};

// Parse arrow function expression with given parameters.

pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;

  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression")
};

// Parse function body and check parameters.

pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) { this.strict = true; }

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
    node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};

pp$5.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1)
    {
    var param = list[i];

    if (param.type !== "Identifier") { return false
  } }
  return true
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = Object.create(null);
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) { break }
    } else { first = false; }

    var elt = (void 0);
    if (allowEmpty && this.type === types$1.comma)
      { elt = null; }
    else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
        { refDestructuringErrors.trailingComma = this.start; }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts
};

pp$5.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;

  if (this.inGenerator && name === "yield")
    { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
  if (this.inAsync && name === "await")
    { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
  if (this.currentThisScope().inClassFieldInit && name === "arguments")
    { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
    { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
  if (this.keywords.test(name))
    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") !== -1) { return }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  }
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos)
      { this.awaitIdentPos = node.start; }
  }
  return node
};

pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
      (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node
};

pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");

  // For validating existence
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }

  return node
};

// Parses yield expression inside generator.

pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) { this.yieldPos = this.start; }

  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression")
};

pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) { this.awaitPos = this.start; }

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression")
};

var pp$4 = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  throw err
};

pp$4.raiseRecoverable = pp$4.raise;

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
};

var pp$3 = Parser.prototype;

var Scope = function Scope(flags) {
  this.flags = flags;
  // A list of var-declared names in the current lexical scope
  this.var = [];
  // A list of lexically-declared names in the current lexical scope
  this.lexical = [];
  // A list of lexically-declared FunctionDeclaration names in the current lexical scope
  this.functions = [];
  // A switch to disallow the identifier reference 'arguments'
  this.inClassFieldInit = false;
};

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};

pp$3.exitScope = function() {
  this.scopeStack.pop();
};

// The spec says:
// > At the top level of a function, or script, function declarations are
// > treated like var declarations rather than like lexical declarations.
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
};

pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && (scope.flags & SCOPE_TOP))
      { delete this.undefinedExports[name]; }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar)
      { redeclared = scope$2.lexical.indexOf(name) > -1; }
    else
      { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
    scope$2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
      var scope$3 = this.scopeStack[i];
      if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
          !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break
      }
      scope$3.var.push(name);
      if (this.inModule && (scope$3.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
      if (scope$3.flags & SCOPE_VAR) { break }
    }
  }
  if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
};

pp$3.checkLocalExport = function(id) {
  // scope.functions must be empty as Module code is always strict.
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};

pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1]
};

pp$3.currentVarScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & SCOPE_VAR) { return scope }
  }
};

// Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
pp$3.currentThisScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
  }
};

var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations)
    { this.loc = new SourceLocation(parser, loc); }
  if (parser.options.directSourceFile)
    { this.sourceFile = parser.options.directSourceFile; }
  if (parser.options.ranges)
    { this.range = [pos, 0]; }
};

// Start an AST node, attaching a start offset.

var pp$2 = Parser.prototype;

pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc)
};

pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations)
    { node.loc.end = loc; }
  if (this.options.ranges)
    { node.range[1] = pos; }
  return node
}

pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
};

// Finish node at given position

pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
};

pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) { newNode[prop] = node[prop]; }
  return newNode
};

// This file contains Unicode properties extracted from the ECMAScript specification.
// The lists are extracted like so:
// $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

// #table-binary-unicode-properties
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;

var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};

// #table-binary-unicode-properties-of-strings
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};

// #table-unicode-general-category-values
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

// #table-unicode-script-values
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " Hrkt Katakana_Or_Hiragana Kawi Nag_Mundari Nagm Unknown Zzzz";

var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};

var data = {};
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;

  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}

for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  var ecmaVersion = list[i];

  buildUnicodeData(ecmaVersion);
}

var pp$1 = Parser.prototype;

// Track disjunction structure to determine whether a duplicate
// capture group name is allowed because it is in a separate branch.
var BranchID = function BranchID(parent, base) {
  // Parent disjunction branch
  this.parent = parent;
  // Identifies this set of sibling branches
  this.base = base || this;
};

BranchID.prototype.separatedFrom = function separatedFrom (alt) {
  // A branch is separate from another branch if they or any of
  // their parents are siblings in a given disjunction
  for (var self = this; self; self = self.parent) {
    for (var other = alt; other; other = other.parent) {
      if (self.base === other.base && self !== other) { return true }
    }
  }
  return false
};

BranchID.prototype.sibling = function sibling () {
  return new BranchID(this.parent, this.base)
};

var RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
};

RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
};

RegExpValidationState.prototype.raise = function raise (message) {
  this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
};

// If u flag is given, this returns the code point at the index (it combines a surrogate pair).
// Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
RegExpValidationState.prototype.at = function at (i, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1
  }
  var c = s.charCodeAt(i);
  if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
    return c
  }
  var next = s.charCodeAt(i + 1);
  return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
};

RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l
  }
  var c = s.charCodeAt(i), next;
  if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
      (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
    return i + 1
  }
  return i + 2
};

RegExpValidationState.prototype.current = function current (forceU) {
    if ( forceU === void 0 ) forceU = false;

  return this.at(this.pos, forceU)
};

RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
    if ( forceU === void 0 ) forceU = false;

  return this.at(this.nextIndex(this.pos, forceU), forceU)
};

RegExpValidationState.prototype.advance = function advance (forceU) {
    if ( forceU === void 0 ) forceU = false;

  this.pos = this.nextIndex(this.pos, forceU);
};

RegExpValidationState.prototype.eat = function eat (ch, forceU) {
    if ( forceU === void 0 ) forceU = false;

  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true
  }
  return false
};

RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var pos = this.pos;
  for (var i = 0, list = chs; i < list.length; i += 1) {
    var ch = list[i];

      var current = this.at(pos, forceU);
    if (current === -1 || current !== ch) {
      return false
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true
};

/**
 * Validate the flags part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;

  var u = false;
  var v = false;

  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") { u = true; }
    if (flag === "v") { v = true; }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};

function hasProp(obj) {
  for (var _ in obj) { return true }
  return false
}

/**
 * Validate the pattern part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);

  // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
  // parsing contains a |GroupName|, reparse with the goal symbol
  // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
  // exception if _P_ did not conform to the grammar, if any elements of _P_
  // were not matched by the parse, or if any Early Error conditions exist.
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;

  this.regexp_disjunction(state);

  if (state.pos !== state.source.length) {
    // Make the same messages as V8.
    if (state.eat(0x29 /* ) */)) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];

    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
  this.regexp_alternative(state);
  while (state.eat(0x7C /* | */)) {
    if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) { state.branchID = state.branchID.parent; }

  // Make the same message as V8.
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(0x7B /* { */)) {
    state.raise("Lone quantifier brackets");
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    // Handle `QuantifiableAssertion Quantifier` alternative.
    // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
    // is a QuantifiableAssertion.
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      // Make the same message as V8.
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true
  }

  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;

  // ^, $
  if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
    return true
  }

  // \b \B
  if (state.eat(0x5C /* \ */)) {
    if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
      return true
    }
    state.pos = start;
  }

  // Lookahead / Lookbehind
  if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(0x3C /* < */);
    }
    if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
      this.regexp_disjunction(state);
      if (!state.eat(0x29 /* ) */)) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true
    }
  }

  state.pos = start;
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
pp$1.regexp_eatQuantifier = function(state, noError) {
  if ( noError === void 0 ) noError = false;

  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(0x3F /* ? */);
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return (
    state.eat(0x2A /* * */) ||
    state.eat(0x2B /* + */) ||
    state.eat(0x3F /* ? */) ||
    this.regexp_eatBracedQuantifier(state, noError)
  )
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(0x7B /* { */)) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(0x7D /* } */)) {
        // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
pp$1.regexp_eatAtom = function(state) {
  return (
    this.regexp_eatPatternCharacters(state) ||
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state)
  )
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatAtomEscape(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(0x28 /* ( */)) {
    if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        return true
      }
      state.raise("Unterminated group");
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(0x28 /* ( */)) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 0x3F /* ? */) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(0x29 /* ) */)) {
      state.numCapturingParens += 1;
      return true
    }
    state.raise("Unterminated group");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
pp$1.regexp_eatExtendedAtom = function(state) {
  return (
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state) ||
    this.regexp_eatInvalidBracedQuantifier(state) ||
    this.regexp_eatExtendedPatternCharacter(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};
function isSyntaxCharacter(ch) {
  return (
    ch === 0x24 /* $ */ ||
    ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
    ch === 0x2E /* . */ ||
    ch === 0x3F /* ? */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
// But eat eager.
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (
    ch !== -1 &&
    ch !== 0x24 /* $ */ &&
    !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
    ch !== 0x2E /* . */ &&
    ch !== 0x3F /* ? */ &&
    ch !== 0x5B /* [ */ &&
    ch !== 0x5E /* ^ */ &&
    ch !== 0x7C /* | */
  ) {
    state.advance();
    return true
  }
  return false
};

// GroupSpecifier ::
//   [empty]
//   `?` GroupName
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(0x3F /* ? */)) {
    if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i = 0, list = known; i < list.length; i += 1) {
          var altID = list[i];

          if (!altID.separatedFrom(state.branchID))
            { state.raise("Duplicate capture group name"); }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};

// GroupName ::
//   `<` RegExpIdentifierName `>`
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(0x3C /* < */)) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
      return true
    }
    state.raise("Invalid capture group name");
  }
  return false
};

// RegExpIdentifierName ::
//   RegExpIdentifierStart
//   RegExpIdentifierName RegExpIdentifierPart
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true
  }
  return false
};

// RegExpIdentifierStart ::
//   UnicodeIDStart
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[+U]
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
}

// RegExpIdentifierPart ::
//   UnicodeIDContinue
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[+U]
//   <ZWNJ>
//   <ZWJ>
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
pp$1.regexp_eatAtomEscape = function(state) {
  if (
    this.regexp_eatBackReference(state) ||
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state) ||
    (state.switchN && this.regexp_eatKGroupName(state))
  ) {
    return true
  }
  if (state.switchU) {
    // Make the same message as V8.
    if (state.current() === 0x63 /* c */) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true
    }
    if (n <= state.numCapturingParens) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(0x6B /* k */)) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true
    }
    state.raise("Invalid named reference");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
pp$1.regexp_eatCharacterEscape = function(state) {
  return (
    this.regexp_eatControlEscape(state) ||
    this.regexp_eatCControlLetter(state) ||
    this.regexp_eatZero(state) ||
    this.regexp_eatHexEscapeSequence(state) ||
    this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
    (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
    this.regexp_eatIdentityEscape(state)
  )
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(0x63 /* c */)) {
    if (this.regexp_eatControlLetter(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 0x74 /* t */) {
    state.lastIntValue = 0x09; /* \t */
    state.advance();
    return true
  }
  if (ch === 0x6E /* n */) {
    state.lastIntValue = 0x0A; /* \n */
    state.advance();
    return true
  }
  if (ch === 0x76 /* v */) {
    state.lastIntValue = 0x0B; /* \v */
    state.advance();
    return true
  }
  if (ch === 0x66 /* f */) {
    state.lastIntValue = 0x0C; /* \f */
    state.advance();
    return true
  }
  if (ch === 0x72 /* r */) {
    state.lastIntValue = 0x0D; /* \r */
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};
function isControlLetter(ch) {
  return (
    (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
    (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if ( forceU === void 0 ) forceU = false;

  var start = state.pos;
  var switchU = forceU || state.switchU;

  if (state.eat(0x75 /* u */)) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 0xDC00 && trail <= 0xDFFF) {
            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
            return true
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true
    }
    if (
      switchU &&
      state.eat(0x7B /* { */) &&
      this.regexp_eatHexDigits(state) &&
      state.eat(0x7D /* } */) &&
      isValidUnicode(state.lastIntValue)
    ) {
      return true
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }

  return false
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 0x10FFFF
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true
    }
    if (state.eat(0x2F /* / */)) {
      state.lastIntValue = 0x2F; /* / */
      return true
    }
    return false
  }

  var ch = state.current();
  if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
    return true
  }
  return false
};

// Return values used by character set parsing methods, needed to
// forbid negation of sets that can match strings.
var CharSetNone = 0; // Nothing parsed
var CharSetOk = 1; // Construct parsed, cannot contain strings
var CharSetString = 2; // Construct parsed, can contain strings

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();

  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk
  }

  var negate = false;
  if (
    state.switchU &&
    this.options.ecmaVersion >= 9 &&
    ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
  ) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (
      state.eat(0x7B /* { */) &&
      (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
      state.eat(0x7D /* } */)
    ) {
      if (negate && result === CharSetString) { state.raise("Invalid property name"); }
      return result
    }
    state.raise("Invalid property name");
  }

  return CharSetNone
};

function isCharacterClassEscape(ch) {
  return (
    ch === 0x64 /* d */ ||
    ch === 0x44 /* D */ ||
    ch === 0x73 /* s */ ||
    ch === 0x53 /* S */ ||
    ch === 0x77 /* w */ ||
    ch === 0x57 /* W */
  )
}

// UnicodePropertyValueExpression ::
//   UnicodePropertyName `=` UnicodePropertyValue
//   LoneUnicodePropertyNameOrValue
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;

  // UnicodePropertyName `=` UnicodePropertyValue
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk
    }
  }
  state.pos = start;

  // LoneUnicodePropertyNameOrValue
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
  }
  return CharSetNone
};

pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name))
    { state.raise("Invalid property name"); }
  if (!state.unicodeProperties.nonBinary[name].test(value))
    { state.raise("Invalid property value"); }
};

pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
  state.raise("Invalid property name");
};

// UnicodePropertyName ::
//   UnicodePropertyNameCharacters
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};

function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 0x5F /* _ */
}

// UnicodePropertyValue ::
//   UnicodePropertyValueCharacters
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
}

// LoneUnicodePropertyNameOrValue ::
//   UnicodePropertyValueCharacters
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state)
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(0x5B /* [ */)) {
    var negate = state.eat(0x5E /* ^ */);
    var result = this.regexp_classContents(state);
    if (!state.eat(0x5D /* ] */))
      { state.raise("Unterminated character class"); }
    if (negate && result === CharSetString)
      { state.raise("Negated character class may contain strings"); }
    return true
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassContents
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
pp$1.regexp_classContents = function(state) {
  if (state.current() === 0x5D /* ] */) { return CharSetOk }
  if (state.switchV) { return this.regexp_classSetExpression(state) }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;

  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatClassEscape(state)) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      var ch$1 = state.current();
      if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }

  var ch = state.current();
  if (ch !== 0x5D /* ] */) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;

  if (state.eat(0x62 /* b */)) {
    state.lastIntValue = 0x08; /* <BS> */
    return true
  }

  if (state.switchU && state.eat(0x2D /* - */)) {
    state.lastIntValue = 0x2D; /* - */
    return true
  }

  if (!state.switchU && state.eat(0x63 /* c */)) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true
    }
    state.pos = start;
  }

  return (
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state)
  )
};

// https://tc39.es/ecma262/#prod-ClassSetExpression
// https://tc39.es/ecma262/#prod-ClassUnion
// https://tc39.es/ecma262/#prod-ClassIntersection
// https://tc39.es/ecma262/#prod-ClassSubtraction
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) { result = CharSetString; }
    // https://tc39.es/ecma262/#prod-ClassIntersection
    var start = state.pos;
    while (state.eatChars([0x26, 0x26] /* && */)) {
      if (
        state.current() !== 0x26 /* & */ &&
        (subResult = this.regexp_eatClassSetOperand(state))
      ) {
        if (subResult !== CharSetString) { result = CharSetOk; }
        continue
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) { return result }
    // https://tc39.es/ecma262/#prod-ClassSubtraction
    while (state.eatChars([0x2D, 0x2D] /* -- */)) {
      if (this.regexp_eatClassSetOperand(state)) { continue }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) { return result }
  } else {
    state.raise("Invalid character in character class");
  }
  // https://tc39.es/ecma262/#prod-ClassUnion
  for (;;) {
    if (this.regexp_eatClassSetRange(state)) { continue }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) { return result }
    if (subResult === CharSetString) { result = CharSetString; }
  }
};

// https://tc39.es/ecma262/#prod-ClassSetRange
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true
    }
    state.pos = start;
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassSetOperand
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
};

// https://tc39.es/ecma262/#prod-NestedClass
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(0x5B /* [ */)) {
    var negate = state.eat(0x5E /* ^ */);
    var result = this.regexp_classContents(state);
    if (state.eat(0x5D /* ] */)) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result
    }
    state.pos = start;
  }
  if (state.eat(0x5C /* \ */)) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1
    }
    state.pos = start;
  }
  return null
};

// https://tc39.es/ecma262/#prod-ClassStringDisjunction
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars([0x5C, 0x71] /* \q */)) {
    if (state.eat(0x7B /* { */)) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(0x7D /* } */)) {
        return result
      }
    } else {
      // Make the same message as V8.
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null
};

// https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(0x7C /* | */)) {
    if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
  }
  return result
};

// https://tc39.es/ecma262/#prod-ClassString
// https://tc39.es/ecma262/#prod-NonEmptyClassString
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) { count++; }
  return count === 1 ? CharSetOk : CharSetString
};

// https://tc39.es/ecma262/#prod-ClassSetCharacter
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (
      this.regexp_eatCharacterEscape(state) ||
      this.regexp_eatClassSetReservedPunctuator(state)
    ) {
      return true
    }
    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }
    state.pos = start;
    return false
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
  if (isClassSetSyntaxCharacter(ch)) { return false }
  state.advance();
  state.lastIntValue = ch;
  return true
};

// https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return (
    ch === 0x21 /* ! */ ||
    ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
    ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
    ch === 0x2E /* . */ ||
    ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
    ch === 0x5E /* ^ */ ||
    ch === 0x60 /* ` */ ||
    ch === 0x7E /* ~ */
  )
}

// https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
function isClassSetSyntaxCharacter(ch) {
  return (
    ch === 0x28 /* ( */ ||
    ch === 0x29 /* ) */ ||
    ch === 0x2D /* - */ ||
    ch === 0x2F /* / */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
function isClassSetReservedPunctuator(ch) {
  return (
    ch === 0x21 /* ! */ ||
    ch === 0x23 /* # */ ||
    ch === 0x25 /* % */ ||
    ch === 0x26 /* & */ ||
    ch === 0x2C /* , */ ||
    ch === 0x2D /* - */ ||
    ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
    ch === 0x40 /* @ */ ||
    ch === 0x60 /* ` */ ||
    ch === 0x7E /* ~ */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(0x78 /* x */)) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
    state.advance();
  }
  return state.pos !== start
};
function isDecimalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start
};
function isHexDigit(ch) {
  return (
    (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
    (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
    (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
  )
}
function hexToInt(ch) {
  if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
    return 10 + (ch - 0x41 /* A */)
  }
  if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
    return 10 + (ch - 0x61 /* a */)
  }
  return ch - 0x30 /* 0 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
// Allows only 0-377(octal) i.e. 0-255(decimal).
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 0x30; /* 0 */
    state.advance();
    return true
  }
  state.lastIntValue = 0;
  return false
};
function isOctalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
// And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true
};

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations)
    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  if (p.options.ranges)
    { this.range = [p.start, p.end]; }
};

// ## Tokenizer

var pp = Parser.prototype;

// Move to the next token

pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
    { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
  if (this.options.onToken)
    { this.options.onToken(new Token(this)); }

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp.getToken = function() {
  this.next();
  return new Token(this)
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  { pp[Symbol.iterator] = function() {
    var this$1$1 = this;

    return {
      next: function () {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        }
      }
    }
  }; }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

// Read a single token, updating the parser object's token-related
// properties.

pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  this.start = this.pos;
  if (this.options.locations) { this.startLoc = this.curPosition(); }
  if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

  if (curContext.override) { return curContext.override(this) }
  else { this.readToken(this.fullCharCodeAtPos()); }
};

pp.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    { return this.readWord() }

  return this.getTokenFromCode(code)
};

pp.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xdc00) { return code }
  var next = this.input.charCodeAt(this.pos + 1);
  return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
};

pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment)
    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition()); }
};

pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment)
    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition()); }
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp.skipSpace = function() {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
    case 32: case 160: // ' '
      ++this.pos;
      break
    case 13:
      if (this.input.charCodeAt(this.pos + 1) === 10) {
        ++this.pos;
      }
    case 10: case 8232: case 8233:
      ++this.pos;
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      break
    case 47: // '/'
      switch (this.input.charCodeAt(this.pos + 1)) {
      case 42: // '*'
        this.skipBlockComment();
        break
      case 47:
        this.skipLineComment(2);
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this.pos;
      } else {
        break loop
      }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) { this.endLoc = this.curPosition(); }
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) { return this.readNumber(true) }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(types$1.ellipsis)
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot)
  }
};

pp.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.slash, 1)
};

pp.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
  return this.finishOp(tokentype, size)
};

pp.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
  }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
};

pp.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.bitwiseXOR, 1)
};

pp.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken()
    }
    return this.finishOp(types$1.incDec, 2)
  }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.plusMin, 1)
};

pp.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(types$1.bitShift, size)
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
      this.input.charCodeAt(this.pos + 3) === 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken()
  }
  if (next === 61) { size = 2; }
  return this.finishOp(types$1.relational, size)
};

pp.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2;
    return this.finishToken(types$1.arrow)
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
};

pp.readToken_question = function() { // '?'
  var ecmaVersion = this.options.ecmaVersion;
  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(types$1.coalesce, 2)
    }
  }
  return this.finishOp(types$1.question, 1)
};

pp.readToken_numberSign = function() { // '#'
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35; // '#'
  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
      return this.finishToken(types$1.privateId, this.readWord1())
    }
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.getTokenFromCode = function(code) {
  switch (code) {
  // The interpretation of a dot depends on whether it is followed
  // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(types$1.parenL)
  case 41: ++this.pos; return this.finishToken(types$1.parenR)
  case 59: ++this.pos; return this.finishToken(types$1.semi)
  case 44: ++this.pos; return this.finishToken(types$1.comma)
  case 91: ++this.pos; return this.finishToken(types$1.bracketL)
  case 93: ++this.pos; return this.finishToken(types$1.bracketR)
  case 123: ++this.pos; return this.finishToken(types$1.braceL)
  case 125: ++this.pos; return this.finishToken(types$1.braceR)
  case 58: ++this.pos; return this.finishToken(types$1.colon)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) { break }
    ++this.pos;
    return this.finishToken(types$1.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.
  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 63: // '?'
    return this.readToken_question()

  case 126: // '~'
    return this.finishOp(types$1.prefix, 1)

  case 35: // '#'
    return this.readToken_numberSign()
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str)
};

pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
    if (!escaped) {
      if (ch === "[") { inClass = true; }
      else if (ch === "]" && inClass) { inClass = false; }
      else if (ch === "/" && !inClass) { break }
      escaped = ch === "\\";
    } else { escaped = false; }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) { this.unexpected(flagsStart); }

  // Validate pattern
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);

  // Create Literal#value property value.
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
    // ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  // `len` is used for character escape sequences. In that case, disallow separators.
  var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

  // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
  // and isn't fraction part nor exponent part. In that case, if the first digit
  // is zero then disallow separators.
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

  var start = this.pos, total = 0, lastCode = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = (void 0);

    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
      if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
      if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
      lastCode = code;
      continue
    }

    if (code >= 97) { val = code - 97 + 10; } // a
    else if (code >= 65) { val = code - 65 + 10; } // A
    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
    else { val = Infinity; }
    if (val >= radix) { break }
    lastCode = code;
    total = total * radix + val;
  }

  if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
  if (this.pos === start || len != null && this.pos - start !== len) { return null }

  return total
};

function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8)
  }

  // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
  return parseFloat(str.replace(/_/g, ""))
}

function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null
  }

  // `BigInt(value)` throws syntax error if the string contains numeric separators.
  return BigInt(str.replace(/_/g, ""))
}

pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  return this.finishToken(types$1.num, val)
};

// Read an integer, octal integer, or floating-point number.

pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) { this.raise(start, "Invalid number"); }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val$1)
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  if (next === 46 && !octal) { // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) { ++this.pos; } // '+-'
    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val)
};

// Read a string value, interpreting backslash-escapes.

pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) { this.unexpected(); }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  } else {
    code = this.readHexChar(4);
  }
  return code
};

pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) { break }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 0x2028 || ch === 0x2029) {
      if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out)
};

// Reads template string tokens.

var INVALID_TEMPLATE_ESCAPE_ERROR = {};

pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err
    }
  }

  this.inTemplateElement = false;
};

pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message);
  }
};

pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL)
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote)
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out)
    }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
      case 10:
        out += "\n";
        break
      default:
        out += String.fromCharCode(ch);
        break
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};

// Reads a template token to search for the end, without validating any escape sequences
pp.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
    case "\\":
      ++this.pos;
      break

    case "$":
      if (this.input[this.pos + 1] !== "{") { break }
      // fall through
    case "`":
      return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

    case "\r":
      if (this.input[this.pos + 1] === "\n") { ++this.pos; }
      // fall through
    case "\n": case "\u2028": case "\u2029":
      ++this.curLine;
      this.lineStart = this.pos + 1;
      break
    }
  }
  this.raise(this.start, "Unterminated template");
};

// Used to read escaped characters

pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
    return ""
  case 56:
  case 57:
    if (this.strict) {
      this.invalidStringToken(
        this.pos - 1,
        "Invalid escape sequence"
      );
    }
    if (inTemplate) {
      var codePos = this.pos - 1;

      this.invalidStringToken(
        codePos,
        "Invalid escape sequence in template string"
      );
    }
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
      var octal = parseInt(octalStr, 8);
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1);
        octal = parseInt(octalStr, 8);
      }
      this.pos += octalStr.length - 1;
      ch = this.input.charCodeAt(this.pos);
      if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(
          this.pos - 1 - octalStr.length,
          inTemplate
            ? "Octal literal in template string"
            : "Octal literal in strict mode"
        );
      }
      return String.fromCharCode(octal)
    }
    if (isNewLine(ch)) {
      // Unicode new line characters after \ get removed from output in both
      // template literals and strings
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    }
    return String.fromCharCode(ch)
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  return n
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) { // "\"
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) // "u"
        { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos)
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word)
};

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/acornjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/acornjs/acorn/issues
//
// [walk]: util/walk.js


var version = "8.12.0";

Parser.acorn = {
  Parser: Parser,
  version: version,
  defaultOptions: defaultOptions,
  Position: Position,
  SourceLocation: SourceLocation,
  getLineInfo: getLineInfo,
  Node: Node,
  TokenType: TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext: TokContext,
  tokContexts: types,
  isIdentifierChar: isIdentifierChar,
  isIdentifierStart: isIdentifierStart,
  Token: Token,
  isNewLine: isNewLine,
  lineBreak: lineBreak,
  lineBreakG: lineBreakG,
  nonASCIIwhitespace: nonASCIIwhitespace
};

var dummyValue = "✖";

function isDummy(node) { return node.name === dummyValue }

function noop() {}

var LooseParser = function LooseParser(input, options) {
  if ( options === void 0 ) options = {};

  this.toks = this.constructor.BaseParser.tokenizer(input, options);
  this.options = this.toks.options;
  this.input = this.toks.input;
  this.tok = this.last = {type: types$1.eof, start: 0, end: 0};
  this.tok.validateRegExpFlags = noop;
  this.tok.validateRegExpPattern = noop;
  if (this.options.locations) {
    var here = this.toks.curPosition();
    this.tok.loc = new SourceLocation(this.toks, here, here);
  }
  this.ahead = []; // Tokens ahead
  this.context = []; // Indentation contexted
  this.curIndent = 0;
  this.curLineStart = 0;
  this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
  this.inAsync = false;
  this.inGenerator = false;
  this.inFunction = false;
};

LooseParser.prototype.startNode = function startNode () {
  return new Node(this.toks, this.tok.start, this.options.locations ? this.tok.loc.start : null)
};

LooseParser.prototype.storeCurrentPos = function storeCurrentPos () {
  return this.options.locations ? [this.tok.start, this.tok.loc.start] : this.tok.start
};

LooseParser.prototype.startNodeAt = function startNodeAt (pos) {
  if (this.options.locations) {
    return new Node(this.toks, pos[0], pos[1])
  } else {
    return new Node(this.toks, pos)
  }
};

LooseParser.prototype.finishNode = function finishNode (node, type) {
  node.type = type;
  node.end = this.last.end;
  if (this.options.locations)
    { node.loc.end = this.last.loc.end; }
  if (this.options.ranges)
    { node.range[1] = this.last.end; }
  return node
};

LooseParser.prototype.dummyNode = function dummyNode (type) {
  var dummy = this.startNode();
  dummy.type = type;
  dummy.end = dummy.start;
  if (this.options.locations)
    { dummy.loc.end = dummy.loc.start; }
  if (this.options.ranges)
    { dummy.range[1] = dummy.start; }
  this.last = {type: types$1.name, start: dummy.start, end: dummy.start, loc: dummy.loc};
  return dummy
};

LooseParser.prototype.dummyIdent = function dummyIdent () {
  var dummy = this.dummyNode("Identifier");
  dummy.name = dummyValue;
  return dummy
};

LooseParser.prototype.dummyString = function dummyString () {
  var dummy = this.dummyNode("Literal");
  dummy.value = dummy.raw = dummyValue;
  return dummy
};

LooseParser.prototype.eat = function eat (type) {
  if (this.tok.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

LooseParser.prototype.isContextual = function isContextual (name) {
  return this.tok.type === types$1.name && this.tok.value === name
};

LooseParser.prototype.eatContextual = function eatContextual (name) {
  return this.tok.value === name && this.eat(types$1.name)
};

LooseParser.prototype.canInsertSemicolon = function canInsertSemicolon () {
  return this.tok.type === types$1.eof || this.tok.type === types$1.braceR ||
    lineBreak.test(this.input.slice(this.last.end, this.tok.start))
};

LooseParser.prototype.semicolon = function semicolon () {
  return this.eat(types$1.semi)
};

LooseParser.prototype.expect = function expect (type) {
  if (this.eat(type)) { return true }
  for (var i = 1; i <= 2; i++) {
    if (this.lookAhead(i).type === type) {
      for (var j = 0; j < i; j++) { this.next(); }
      return true
    }
  }
};

LooseParser.prototype.pushCx = function pushCx () {
  this.context.push(this.curIndent);
};

LooseParser.prototype.popCx = function popCx () {
  this.curIndent = this.context.pop();
};

LooseParser.prototype.lineEnd = function lineEnd (pos) {
  while (pos < this.input.length && !isNewLine(this.input.charCodeAt(pos))) { ++pos; }
  return pos
};

LooseParser.prototype.indentationAfter = function indentationAfter (pos) {
  for (var count = 0;; ++pos) {
    var ch = this.input.charCodeAt(pos);
    if (ch === 32) { ++count; }
    else if (ch === 9) { count += this.options.tabSize; }
    else { return count }
  }
};

LooseParser.prototype.closes = function closes (closeTok, indent, line, blockHeuristic) {
  if (this.tok.type === closeTok || this.tok.type === types$1.eof) { return true }
  return line !== this.curLineStart && this.curIndent < indent && this.tokenStartsLine() &&
    (!blockHeuristic || this.nextLineStart >= this.input.length ||
     this.indentationAfter(this.nextLineStart) < indent)
};

LooseParser.prototype.tokenStartsLine = function tokenStartsLine () {
  for (var p = this.tok.start - 1; p >= this.curLineStart; --p) {
    var ch = this.input.charCodeAt(p);
    if (ch !== 9 && ch !== 32) { return false }
  }
  return true
};

LooseParser.prototype.extend = function extend (name, f) {
  this[name] = f(this[name]);
};

LooseParser.prototype.parse = function parse () {
  this.next();
  return this.parseTopLevel()
};

LooseParser.extend = function extend () {
    var plugins = [], len = arguments.length;
    while ( len-- ) plugins[ len ] = arguments[ len ];

  var cls = this;
  for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
  return cls
};

LooseParser.parse = function parse (input, options) {
  return new this(input, options).parse()
};

// Allows plugins to extend the base parser / tokenizer used
LooseParser.BaseParser = Parser;

var lp$2 = LooseParser.prototype;

function isSpace(ch) {
  return (ch < 14 && ch > 8) || ch === 32 || ch === 160 || isNewLine(ch)
}

lp$2.next = function() {
  this.last = this.tok;
  if (this.ahead.length)
    { this.tok = this.ahead.shift(); }
  else
    { this.tok = this.readToken(); }

  if (this.tok.start >= this.nextLineStart) {
    while (this.tok.start >= this.nextLineStart) {
      this.curLineStart = this.nextLineStart;
      this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
    }
    this.curIndent = this.indentationAfter(this.curLineStart);
  }
};

lp$2.readToken = function() {
  for (;;) {
    try {
      this.toks.next();
      if (this.toks.type === types$1.dot &&
          this.input.substr(this.toks.end, 1) === "." &&
          this.options.ecmaVersion >= 6) {
        this.toks.end++;
        this.toks.type = types$1.ellipsis;
      }
      return new Token(this.toks)
    } catch (e) {
      if (!(e instanceof SyntaxError)) { throw e }

      // Try to skip some text, based on the error message, and then continue
      var msg = e.message, pos = e.raisedAt, replace = true;
      if (/unterminated/i.test(msg)) {
        pos = this.lineEnd(e.pos + 1);
        if (/string/.test(msg)) {
          replace = {start: e.pos, end: pos, type: types$1.string, value: this.input.slice(e.pos + 1, pos)};
        } else if (/regular expr/i.test(msg)) {
          var re = this.input.slice(e.pos, pos);
          try { re = new RegExp(re); } catch (e$1) { /* ignore compilation error due to new syntax */ }
          replace = {start: e.pos, end: pos, type: types$1.regexp, value: re};
        } else if (/template/.test(msg)) {
          replace = {
            start: e.pos,
            end: pos,
            type: types$1.template,
            value: this.input.slice(e.pos, pos)
          };
        } else {
          replace = false;
        }
      } else if (/invalid (unicode|regexp|number)|expecting unicode|octal literal|is reserved|directly after number|expected number in radix/i.test(msg)) {
        while (pos < this.input.length && !isSpace(this.input.charCodeAt(pos))) { ++pos; }
      } else if (/character escape|expected hexadecimal/i.test(msg)) {
        while (pos < this.input.length) {
          var ch = this.input.charCodeAt(pos++);
          if (ch === 34 || ch === 39 || isNewLine(ch)) { break }
        }
      } else if (/unexpected character/i.test(msg)) {
        pos++;
        replace = false;
      } else if (/regular expression/i.test(msg)) {
        replace = true;
      } else {
        throw e
      }
      this.resetTo(pos);
      if (replace === true) { replace = {start: pos, end: pos, type: types$1.name, value: dummyValue}; }
      if (replace) {
        if (this.options.locations)
          { replace.loc = new SourceLocation(
            this.toks,
            getLineInfo(this.input, replace.start),
            getLineInfo(this.input, replace.end)); }
        return replace
      }
    }
  }
};

lp$2.resetTo = function(pos) {
  this.toks.pos = pos;
  this.toks.containsEsc = false;
  var ch = this.input.charAt(pos - 1);
  this.toks.exprAllowed = !ch || /[[{(,;:?/*=+\-~!|&%^<>]/.test(ch) ||
    /[enwfd]/.test(ch) &&
    /\b(case|else|return|throw|new|in|(instance|type)?of|delete|void)$/.test(this.input.slice(pos - 10, pos));

  if (this.options.locations) {
    this.toks.curLine = 1;
    this.toks.lineStart = lineBreakG.lastIndex = 0;
    var match;
    while ((match = lineBreakG.exec(this.input)) && match.index < pos) {
      ++this.toks.curLine;
      this.toks.lineStart = match.index + match[0].length;
    }
  }
};

lp$2.lookAhead = function(n) {
  while (n > this.ahead.length)
    { this.ahead.push(this.readToken()); }
  return this.ahead[n - 1]
};

var lp$1 = LooseParser.prototype;

lp$1.parseTopLevel = function() {
  var node = this.startNodeAt(this.options.locations ? [0, getLineInfo(this.input, 0)] : 0);
  node.body = [];
  while (this.tok.type !== types$1.eof) { node.body.push(this.parseStatement()); }
  this.toks.adaptDirectivePrologue(node.body);
  this.last = this.tok;
  node.sourceType = this.options.sourceType;
  return this.finishNode(node, "Program")
};

lp$1.parseStatement = function() {
  var starttype = this.tok.type, node = this.startNode(), kind;

  if (this.toks.isLet()) {
    starttype = types$1._var;
    kind = "let";
  }

  switch (starttype) {
  case types$1._break: case types$1._continue:
    this.next();
    var isBreak = starttype === types$1._break;
    if (this.semicolon() || this.canInsertSemicolon()) {
      node.label = null;
    } else {
      node.label = this.tok.type === types$1.name ? this.parseIdent() : null;
      this.semicolon();
    }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")

  case types$1._debugger:
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")

  case types$1._do:
    this.next();
    node.body = this.parseStatement();
    node.test = this.eat(types$1._while) ? this.parseParenExpression() : this.dummyIdent();
    this.semicolon();
    return this.finishNode(node, "DoWhileStatement")

  case types$1._for:
    this.next(); // `for` keyword
    var isAwait = this.options.ecmaVersion >= 9 && this.eatContextual("await");

    this.pushCx();
    this.expect(types$1.parenL);
    if (this.tok.type === types$1.semi) { return this.parseFor(node, null) }
    var isLet = this.toks.isLet();
    if (isLet || this.tok.type === types$1._var || this.tok.type === types$1._const) {
      var init$1 = this.parseVar(this.startNode(), true, isLet ? "let" : this.tok.value);
      if (init$1.declarations.length === 1 && (this.tok.type === types$1._in || this.isContextual("of"))) {
        if (this.options.ecmaVersion >= 9 && this.tok.type !== types$1._in) {
          node.await = isAwait;
        }
        return this.parseForIn(node, init$1)
      }
      return this.parseFor(node, init$1)
    }
    var init = this.parseExpression(true);
    if (this.tok.type === types$1._in || this.isContextual("of")) {
      if (this.options.ecmaVersion >= 9 && this.tok.type !== types$1._in) {
        node.await = isAwait;
      }
      return this.parseForIn(node, this.toAssignable(init))
    }
    return this.parseFor(node, init)

  case types$1._function:
    this.next();
    return this.parseFunction(node, true)

  case types$1._if:
    this.next();
    node.test = this.parseParenExpression();
    node.consequent = this.parseStatement();
    node.alternate = this.eat(types$1._else) ? this.parseStatement() : null;
    return this.finishNode(node, "IfStatement")

  case types$1._return:
    this.next();
    if (this.eat(types$1.semi) || this.canInsertSemicolon()) { node.argument = null; }
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")

  case types$1._switch:
    var blockIndent = this.curIndent, line = this.curLineStart;
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.pushCx();
    this.expect(types$1.braceL);

    var cur;
    while (!this.closes(types$1.braceR, blockIndent, line, true)) {
      if (this.tok.type === types$1._case || this.tok.type === types$1._default) {
        var isCase = this.tok.type === types$1._case;
        if (cur) { this.finishNode(cur, "SwitchCase"); }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) { cur.test = this.parseExpression(); }
        else { cur.test = null; }
        this.expect(types$1.colon);
      } else {
        if (!cur) {
          node.cases.push(cur = this.startNode());
          cur.consequent = [];
          cur.test = null;
        }
        cur.consequent.push(this.parseStatement());
      }
    }
    if (cur) { this.finishNode(cur, "SwitchCase"); }
    this.popCx();
    this.eat(types$1.braceR);
    return this.finishNode(node, "SwitchStatement")

  case types$1._throw:
    this.next();
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")

  case types$1._try:
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.tok.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.toAssignable(this.parseExprAtom(), true);
        this.expect(types$1.parenR);
      } else {
        clause.param = null;
      }
      clause.body = this.parseBlock();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer) { return node.block }
    return this.finishNode(node, "TryStatement")

  case types$1._var:
  case types$1._const:
    return this.parseVar(node, false, kind || this.tok.value)

  case types$1._while:
    this.next();
    node.test = this.parseParenExpression();
    node.body = this.parseStatement();
    return this.finishNode(node, "WhileStatement")

  case types$1._with:
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement();
    return this.finishNode(node, "WithStatement")

  case types$1.braceL:
    return this.parseBlock()

  case types$1.semi:
    this.next();
    return this.finishNode(node, "EmptyStatement")

  case types$1._class:
    return this.parseClass(true)

  case types$1._import:
    if (this.options.ecmaVersion > 10) {
      var nextType = this.lookAhead(1).type;
      if (nextType === types$1.parenL || nextType === types$1.dot) {
        node.expression = this.parseExpression();
        this.semicolon();
        return this.finishNode(node, "ExpressionStatement")
      }
    }

    return this.parseImport()

  case types$1._export:
    return this.parseExport()

  default:
    if (this.toks.isAsyncFunction()) {
      this.next();
      this.next();
      return this.parseFunction(node, true, true)
    }
    var expr = this.parseExpression();
    if (isDummy(expr)) {
      this.next();
      if (this.tok.type === types$1.eof) { return this.finishNode(node, "EmptyStatement") }
      return this.parseStatement()
    } else if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
      node.body = this.parseStatement();
      node.label = expr;
      return this.finishNode(node, "LabeledStatement")
    } else {
      node.expression = expr;
      this.semicolon();
      return this.finishNode(node, "ExpressionStatement")
    }
  }
};

lp$1.parseBlock = function() {
  var node = this.startNode();
  this.pushCx();
  this.expect(types$1.braceL);
  var blockIndent = this.curIndent, line = this.curLineStart;
  node.body = [];
  while (!this.closes(types$1.braceR, blockIndent, line, true))
    { node.body.push(this.parseStatement()); }
  this.popCx();
  this.eat(types$1.braceR);
  return this.finishNode(node, "BlockStatement")
};

lp$1.parseFor = function(node, init) {
  node.init = init;
  node.test = node.update = null;
  if (this.eat(types$1.semi) && this.tok.type !== types$1.semi) { node.test = this.parseExpression(); }
  if (this.eat(types$1.semi) && this.tok.type !== types$1.parenR) { node.update = this.parseExpression(); }
  this.popCx();
  this.expect(types$1.parenR);
  node.body = this.parseStatement();
  return this.finishNode(node, "ForStatement")
};

lp$1.parseForIn = function(node, init) {
  var type = this.tok.type === types$1._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  node.left = init;
  node.right = this.parseExpression();
  this.popCx();
  this.expect(types$1.parenR);
  node.body = this.parseStatement();
  return this.finishNode(node, type)
};

lp$1.parseVar = function(node, noIn, kind) {
  node.kind = kind;
  this.next();
  node.declarations = [];
  do {
    var decl = this.startNode();
    decl.id = this.options.ecmaVersion >= 6 ? this.toAssignable(this.parseExprAtom(), true) : this.parseIdent();
    decl.init = this.eat(types$1.eq) ? this.parseMaybeAssign(noIn) : null;
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
  } while (this.eat(types$1.comma))
  if (!node.declarations.length) {
    var decl$1 = this.startNode();
    decl$1.id = this.dummyIdent();
    node.declarations.push(this.finishNode(decl$1, "VariableDeclarator"));
  }
  if (!noIn) { this.semicolon(); }
  return this.finishNode(node, "VariableDeclaration")
};

lp$1.parseClass = function(isStatement) {
  var node = this.startNode();
  this.next();
  if (this.tok.type === types$1.name) { node.id = this.parseIdent(); }
  else if (isStatement === true) { node.id = this.dummyIdent(); }
  else { node.id = null; }
  node.superClass = this.eat(types$1._extends) ? this.parseExpression() : null;
  node.body = this.startNode();
  node.body.body = [];
  this.pushCx();
  var indent = this.curIndent + 1, line = this.curLineStart;
  this.eat(types$1.braceL);
  if (this.curIndent + 1 < indent) { indent = this.curIndent; line = this.curLineStart; }
  while (!this.closes(types$1.braceR, indent, line)) {
    var element = this.parseClassElement();
    if (element) { node.body.body.push(element); }
  }
  this.popCx();
  if (!this.eat(types$1.braceR)) {
    // If there is no closing brace, make the node span to the start
    // of the next token (this is useful for Tern)
    this.last.end = this.tok.start;
    if (this.options.locations) { this.last.loc.end = this.tok.loc.start; }
  }
  this.semicolon();
  this.finishNode(node.body, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

lp$1.parseClassElement = function() {
  if (this.eat(types$1.semi)) { return null }

  var ref = this.options;
  var ecmaVersion = ref.ecmaVersion;
  var locations = ref.locations;
  var indent = this.curIndent;
  var line = this.curLineStart;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;

  if (this.eatContextual("static")) {
    // Parse static init block
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node
    }
    if (this.isClassElementNameStart() || this.toks.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.toks.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName) {
    isGenerator = this.eat(types$1.star);
    var lastValue = this.toks.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }

  // Parse element name
  if (keyName) {
    // 'async', 'get', 'set', or 'static' were not a keyword contextually.
    // The last token is any of those. Make it the element name.
    node.computed = false;
    node.key = this.startNodeAt(locations ? [this.toks.lastTokStart, this.toks.lastTokStartLoc] : this.toks.lastTokStart);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);

    // From https://github.com/acornjs/acorn/blob/7deba41118d6384a2c498c61176b3cf434f69590/acorn-loose/src/statement.js#L291
    // Skip broken stuff.
    if (isDummy(node.key)) {
      if (isDummy(this.parseMaybeAssign())) { this.next(); }
      this.eat(types$1.comma);
      return null
    }
  }

  // Parse element value
  if (ecmaVersion < 13 || this.toks.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    // Method
    var isConstructor =
      !node.computed &&
      !node.static &&
      !isGenerator &&
      !isAsync &&
      kind === "method" && (
        node.key.type === "Identifier" && node.key.name === "constructor" ||
        node.key.type === "Literal" && node.key.value === "constructor"
      );
    node.kind = isConstructor ? "constructor" : kind;
    node.value = this.parseMethod(isGenerator, isAsync);
    this.finishNode(node, "MethodDefinition");
  } else {
    // Field
    if (this.eat(types$1.eq)) {
      if (this.curLineStart !== line && this.curIndent <= indent && this.tokenStartsLine()) {
        // Estimated the next line is the next class element by indentations.
        node.value = null;
      } else {
        var oldInAsync = this.inAsync;
        var oldInGenerator = this.inGenerator;
        this.inAsync = false;
        this.inGenerator = false;
        node.value = this.parseMaybeAssign();
        this.inAsync = oldInAsync;
        this.inGenerator = oldInGenerator;
      }
    } else {
      node.value = null;
    }
    this.semicolon();
    this.finishNode(node, "PropertyDefinition");
  }

  return node
};

lp$1.parseClassStaticBlock = function(node) {
  var blockIndent = this.curIndent, line = this.curLineStart;
  node.body = [];
  this.pushCx();
  while (!this.closes(types$1.braceR, blockIndent, line, true))
    { node.body.push(this.parseStatement()); }
  this.popCx();
  this.eat(types$1.braceR);

  return this.finishNode(node, "StaticBlock")
};

lp$1.isClassElementNameStart = function() {
  return this.toks.isClassElementNameStart()
};

lp$1.parseClassElementName = function(element) {
  if (this.toks.type === types$1.privateId) {
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};

lp$1.parseFunction = function(node, isStatement, isAsync) {
  var oldInAsync = this.inAsync, oldInGenerator = this.inGenerator, oldInFunction = this.inFunction;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) {
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  if (this.tok.type === types$1.name) { node.id = this.parseIdent(); }
  else if (isStatement === true) { node.id = this.dummyIdent(); }
  this.inAsync = node.async;
  this.inGenerator = node.generator;
  this.inFunction = true;
  node.params = this.parseFunctionParams();
  node.body = this.parseBlock();
  this.toks.adaptDirectivePrologue(node.body.body);
  this.inAsync = oldInAsync;
  this.inGenerator = oldInGenerator;
  this.inFunction = oldInFunction;
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
};

lp$1.parseExport = function() {
  var node = this.startNode();
  this.next();
  if (this.eat(types$1.star)) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseExprAtom();
      } else {
        node.exported = null;
      }
    }
    node.source = this.eatContextual("from") ? this.parseExprAtom() : this.dummyString();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(types$1._default)) {
    // export default (function foo() {}) // This is FunctionExpression.
    var isAsync;
    if (this.tok.type === types$1._function || (isAsync = this.toks.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      node.declaration = this.parseFunction(fNode, "nullableID", isAsync);
    } else if (this.tok.type === types$1._class) {
      node.declaration = this.parseClass("nullableID");
    } else {
      node.declaration = this.parseMaybeAssign();
      this.semicolon();
    }
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  if (this.tok.type.keyword || this.toks.isLet() || this.toks.isAsyncFunction()) {
    node.declaration = this.parseStatement();
    node.specifiers = [];
    node.source = null;
  } else {
    node.declaration = null;
    node.specifiers = this.parseExportSpecifierList();
    node.source = this.eatContextual("from") ? this.parseExprAtom() : null;
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

lp$1.parseImport = function() {
  var node = this.startNode();
  this.next();
  if (this.tok.type === types$1.string) {
    node.specifiers = [];
    node.source = this.parseExprAtom();
  } else {
    var elt;
    if (this.tok.type === types$1.name && this.tok.value !== "from") {
      elt = this.startNode();
      elt.local = this.parseIdent();
      this.finishNode(elt, "ImportDefaultSpecifier");
      this.eat(types$1.comma);
    }
    node.specifiers = this.parseImportSpecifiers();
    node.source = this.eatContextual("from") && this.tok.type === types$1.string ? this.parseExprAtom() : this.dummyString();
    if (elt) { node.specifiers.unshift(elt); }
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

lp$1.parseImportSpecifiers = function() {
  var elts = [];
  if (this.tok.type === types$1.star) {
    var elt = this.startNode();
    this.next();
    elt.local = this.eatContextual("as") ? this.parseIdent() : this.dummyIdent();
    elts.push(this.finishNode(elt, "ImportNamespaceSpecifier"));
  } else {
    var indent = this.curIndent, line = this.curLineStart, continuedLine = this.nextLineStart;
    this.pushCx();
    this.eat(types$1.braceL);
    if (this.curLineStart > continuedLine) { continuedLine = this.curLineStart; }
    while (!this.closes(types$1.braceR, indent + (this.curLineStart <= continuedLine ? 1 : 0), line)) {
      var elt$1 = this.startNode();
      if (this.eat(types$1.star)) {
        elt$1.local = this.eatContextual("as") ? this.parseModuleExportName() : this.dummyIdent();
        this.finishNode(elt$1, "ImportNamespaceSpecifier");
      } else {
        if (this.isContextual("from")) { break }
        elt$1.imported = this.parseModuleExportName();
        if (isDummy(elt$1.imported)) { break }
        elt$1.local = this.eatContextual("as") ? this.parseModuleExportName() : elt$1.imported;
        this.finishNode(elt$1, "ImportSpecifier");
      }
      elts.push(elt$1);
      this.eat(types$1.comma);
    }
    this.eat(types$1.braceR);
    this.popCx();
  }
  return elts
};

lp$1.parseExportSpecifierList = function() {
  var elts = [];
  var indent = this.curIndent, line = this.curLineStart, continuedLine = this.nextLineStart;
  this.pushCx();
  this.eat(types$1.braceL);
  if (this.curLineStart > continuedLine) { continuedLine = this.curLineStart; }
  while (!this.closes(types$1.braceR, indent + (this.curLineStart <= continuedLine ? 1 : 0), line)) {
    if (this.isContextual("from")) { break }
    var elt = this.startNode();
    elt.local = this.parseModuleExportName();
    if (isDummy(elt.local)) { break }
    elt.exported = this.eatContextual("as") ? this.parseModuleExportName() : elt.local;
    this.finishNode(elt, "ExportSpecifier");
    elts.push(elt);
    this.eat(types$1.comma);
  }
  this.eat(types$1.braceR);
  this.popCx();
  return elts
};

lp$1.parseModuleExportName = function() {
  return this.options.ecmaVersion >= 13 && this.tok.type === types$1.string
    ? this.parseExprAtom()
    : this.parseIdent()
};

var lp = LooseParser.prototype;

lp.checkLVal = function(expr) {
  if (!expr) { return expr }
  switch (expr.type) {
  case "Identifier":
  case "MemberExpression":
    return expr

  case "ParenthesizedExpression":
    expr.expression = this.checkLVal(expr.expression);
    return expr

  default:
    return this.dummyIdent()
  }
};

lp.parseExpression = function(noIn) {
  var start = this.storeCurrentPos();
  var expr = this.parseMaybeAssign(noIn);
  if (this.tok.type === types$1.comma) {
    var node = this.startNodeAt(start);
    node.expressions = [expr];
    while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(noIn)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

lp.parseParenExpression = function() {
  this.pushCx();
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.popCx();
  this.expect(types$1.parenR);
  return val
};

lp.parseMaybeAssign = function(noIn) {
  // `yield` should be an identifier reference if it's not in generator functions.
  if (this.inGenerator && this.toks.isContextual("yield")) {
    var node = this.startNode();
    this.next();
    if (this.semicolon() || this.canInsertSemicolon() || (this.tok.type !== types$1.star && !this.tok.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign();
    }
    return this.finishNode(node, "YieldExpression")
  }

  var start = this.storeCurrentPos();
  var left = this.parseMaybeConditional(noIn);
  if (this.tok.type.isAssign) {
    var node$1 = this.startNodeAt(start);
    node$1.operator = this.tok.value;
    node$1.left = this.tok.type === types$1.eq ? this.toAssignable(left) : this.checkLVal(left);
    this.next();
    node$1.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node$1, "AssignmentExpression")
  }
  return left
};

lp.parseMaybeConditional = function(noIn) {
  var start = this.storeCurrentPos();
  var expr = this.parseExprOps(noIn);
  if (this.eat(types$1.question)) {
    var node = this.startNodeAt(start);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    node.alternate = this.expect(types$1.colon) ? this.parseMaybeAssign(noIn) : this.dummyIdent();
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

lp.parseExprOps = function(noIn) {
  var start = this.storeCurrentPos();
  var indent = this.curIndent, line = this.curLineStart;
  return this.parseExprOp(this.parseMaybeUnary(false), start, -1, noIn, indent, line)
};

lp.parseExprOp = function(left, start, minPrec, noIn, indent, line) {
  if (this.curLineStart !== line && this.curIndent < indent && this.tokenStartsLine()) { return left }
  var prec = this.tok.type.binop;
  if (prec != null && (!noIn || this.tok.type !== types$1._in)) {
    if (prec > minPrec) {
      var node = this.startNodeAt(start);
      node.left = left;
      node.operator = this.tok.value;
      this.next();
      if (this.curLineStart !== line && this.curIndent < indent && this.tokenStartsLine()) {
        node.right = this.dummyIdent();
      } else {
        var rightStart = this.storeCurrentPos();
        node.right = this.parseExprOp(this.parseMaybeUnary(false), rightStart, prec, noIn, indent, line);
      }
      this.finishNode(node, /&&|\|\||\?\?/.test(node.operator) ? "LogicalExpression" : "BinaryExpression");
      return this.parseExprOp(node, start, minPrec, noIn, indent, line)
    }
  }
  return left
};

lp.parseMaybeUnary = function(sawUnary) {
  var start = this.storeCurrentPos(), expr;
  if (this.options.ecmaVersion >= 8 && this.toks.isContextual("await") &&
      (this.inAsync || (this.toks.inModule && this.options.ecmaVersion >= 13) ||
       (!this.inFunction && this.options.allowAwaitOutsideFunction))) {
    expr = this.parseAwait();
    sawUnary = true;
  } else if (this.tok.type.prefix) {
    var node = this.startNode(), update = this.tok.type === types$1.incDec;
    if (!update) { sawUnary = true; }
    node.operator = this.tok.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(true);
    if (update) { node.argument = this.checkLVal(node.argument); }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (this.tok.type === types$1.ellipsis) {
    var node$1 = this.startNode();
    this.next();
    node$1.argument = this.parseMaybeUnary(sawUnary);
    expr = this.finishNode(node$1, "SpreadElement");
  } else if (!sawUnary && this.tok.type === types$1.privateId) {
    expr = this.parsePrivateIdent();
  } else {
    expr = this.parseExprSubscripts();
    while (this.tok.type.postfix && !this.canInsertSemicolon()) {
      var node$2 = this.startNodeAt(start);
      node$2.operator = this.tok.value;
      node$2.prefix = false;
      node$2.argument = this.checkLVal(expr);
      this.next();
      expr = this.finishNode(node$2, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(types$1.starstar)) {
    var node$3 = this.startNodeAt(start);
    node$3.operator = "**";
    node$3.left = expr;
    node$3.right = this.parseMaybeUnary(false);
    return this.finishNode(node$3, "BinaryExpression")
  }

  return expr
};

lp.parseExprSubscripts = function() {
  var start = this.storeCurrentPos();
  return this.parseSubscripts(this.parseExprAtom(), start, false, this.curIndent, this.curLineStart)
};

lp.parseSubscripts = function(base, start, noCalls, startIndent, line) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optionalChained = false;
  for (;;) {
    if (this.curLineStart !== line && this.curIndent <= startIndent && this.tokenStartsLine()) {
      if (this.tok.type === types$1.dot && this.curIndent === startIndent)
        { --startIndent; }
      else
        { break }
    }

    var maybeAsyncArrow = base.type === "Identifier" && base.name === "async" && !this.canInsertSemicolon();
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (optional) {
      optionalChained = true;
    }

    if ((optional && this.tok.type !== types$1.parenL && this.tok.type !== types$1.bracketL && this.tok.type !== types$1.backQuote) || this.eat(types$1.dot)) {
      var node = this.startNodeAt(start);
      node.object = base;
      if (this.curLineStart !== line && this.curIndent <= startIndent && this.tokenStartsLine())
        { node.property = this.dummyIdent(); }
      else
        { node.property = this.parsePropertyAccessor() || this.dummyIdent(); }
      node.computed = false;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (this.tok.type === types$1.bracketL) {
      this.pushCx();
      this.next();
      var node$1 = this.startNodeAt(start);
      node$1.object = base;
      node$1.property = this.parseExpression();
      node$1.computed = true;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      this.popCx();
      this.expect(types$1.bracketR);
      base = this.finishNode(node$1, "MemberExpression");
    } else if (!noCalls && this.tok.type === types$1.parenL) {
      var exprList = this.parseExprList(types$1.parenR);
      if (maybeAsyncArrow && this.eat(types$1.arrow))
        { return this.parseArrowExpression(this.startNodeAt(start), exprList, true) }
      var node$2 = this.startNodeAt(start);
      node$2.callee = base;
      node$2.arguments = exprList;
      if (optionalSupported) {
        node$2.optional = optional;
      }
      base = this.finishNode(node$2, "CallExpression");
    } else if (this.tok.type === types$1.backQuote) {
      var node$3 = this.startNodeAt(start);
      node$3.tag = base;
      node$3.quasi = this.parseTemplate();
      base = this.finishNode(node$3, "TaggedTemplateExpression");
    } else {
      break
    }
  }

  if (optionalChained) {
    var chainNode = this.startNodeAt(start);
    chainNode.expression = base;
    base = this.finishNode(chainNode, "ChainExpression");
  }
  return base
};

lp.parseExprAtom = function() {
  var node;
  switch (this.tok.type) {
  case types$1._this:
  case types$1._super:
    var type = this.tok.type === types$1._this ? "ThisExpression" : "Super";
    node = this.startNode();
    this.next();
    return this.finishNode(node, type)

  case types$1.name:
    var start = this.storeCurrentPos();
    var id = this.parseIdent();
    var isAsync = false;
    if (id.name === "async" && !this.canInsertSemicolon()) {
      if (this.eat(types$1._function)) {
        this.toks.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(start), false, true)
      }
      if (this.tok.type === types$1.name) {
        id = this.parseIdent();
        isAsync = true;
      }
    }
    return this.eat(types$1.arrow) ? this.parseArrowExpression(this.startNodeAt(start), [id], isAsync) : id

  case types$1.regexp:
    node = this.startNode();
    var val = this.tok.value;
    node.regex = {pattern: val.pattern, flags: val.flags};
    node.value = val.value;
    node.raw = this.input.slice(this.tok.start, this.tok.end);
    this.next();
    return this.finishNode(node, "Literal")

  case types$1.num: case types$1.string:
    node = this.startNode();
    node.value = this.tok.value;
    node.raw = this.input.slice(this.tok.start, this.tok.end);
    if (this.tok.type === types$1.num && node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1).replace(/_/g, ""); }
    this.next();
    return this.finishNode(node, "Literal")

  case types$1._null: case types$1._true: case types$1._false:
    node = this.startNode();
    node.value = this.tok.type === types$1._null ? null : this.tok.type === types$1._true;
    node.raw = this.tok.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types$1.parenL:
    var parenStart = this.storeCurrentPos();
    this.next();
    var inner = this.parseExpression();
    this.expect(types$1.parenR);
    if (this.eat(types$1.arrow)) {
      // (a,)=>a // SequenceExpression makes dummy in the last hole. Drop the dummy.
      var params = inner.expressions || [inner];
      if (params.length && isDummy(params[params.length - 1]))
        { params.pop(); }
      return this.parseArrowExpression(this.startNodeAt(parenStart), params)
    }
    if (this.options.preserveParens) {
      var par = this.startNodeAt(parenStart);
      par.expression = inner;
      inner = this.finishNode(par, "ParenthesizedExpression");
    }
    return inner

  case types$1.bracketL:
    node = this.startNode();
    node.elements = this.parseExprList(types$1.bracketR, true);
    return this.finishNode(node, "ArrayExpression")

  case types$1.braceL:
    this.toks.overrideContext(types.b_expr);
    return this.parseObj()

  case types$1._class:
    return this.parseClass(false)

  case types$1._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, false)

  case types$1._new:
    return this.parseNew()

  case types$1.backQuote:
    return this.parseTemplate()

  case types$1._import:
    if (this.options.ecmaVersion >= 11) {
      return this.parseExprImport()
    } else {
      return this.dummyIdent()
    }

  default:
    return this.dummyIdent()
  }
};

lp.parseExprImport = function() {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  switch (this.tok.type) {
  case types$1.parenL:
    return this.parseDynamicImport(node)
  case types$1.dot:
    node.meta = meta;
    return this.parseImportMeta(node)
  default:
    node.name = "import";
    return this.finishNode(node, "Identifier")
  }
};

lp.parseDynamicImport = function(node) {
  node.source = this.parseExprList(types$1.parenR)[0] || this.dummyString();
  return this.finishNode(node, "ImportExpression")
};

lp.parseImportMeta = function(node) {
  this.next(); // skip '.'
  node.property = this.parseIdent(true);
  return this.finishNode(node, "MetaProperty")
};

lp.parseNew = function() {
  var node = this.startNode(), startIndent = this.curIndent, line = this.curLineStart;
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(types$1.dot)) {
    node.meta = meta;
    node.property = this.parseIdent(true);
    return this.finishNode(node, "MetaProperty")
  }
  var start = this.storeCurrentPos();
  node.callee = this.parseSubscripts(this.parseExprAtom(), start, true, startIndent, line);
  if (this.tok.type === types$1.parenL) {
    node.arguments = this.parseExprList(types$1.parenR);
  } else {
    node.arguments = [];
  }
  return this.finishNode(node, "NewExpression")
};

lp.parseTemplateElement = function() {
  var elem = this.startNode();

  // The loose parser accepts invalid unicode escapes even in untagged templates.
  if (this.tok.type === types$1.invalidTemplate) {
    elem.value = {
      raw: this.tok.value,
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.tok.start, this.tok.end).replace(/\r\n?/g, "\n"),
      cooked: this.tok.value
    };
  }
  this.next();
  elem.tail = this.tok.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

lp.parseTemplate = function() {
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement();
  node.quasis = [curElt];
  while (!curElt.tail) {
    this.next();
    node.expressions.push(this.parseExpression());
    if (this.expect(types$1.braceR)) {
      curElt = this.parseTemplateElement();
    } else {
      curElt = this.startNode();
      curElt.value = {cooked: "", raw: ""};
      curElt.tail = true;
      this.finishNode(curElt, "TemplateElement");
    }
    node.quasis.push(curElt);
  }
  this.expect(types$1.backQuote);
  return this.finishNode(node, "TemplateLiteral")
};

lp.parseObj = function() {
  var node = this.startNode();
  node.properties = [];
  this.pushCx();
  var indent = this.curIndent + 1, line = this.curLineStart;
  this.eat(types$1.braceL);
  if (this.curIndent + 1 < indent) { indent = this.curIndent; line = this.curLineStart; }
  while (!this.closes(types$1.braceR, indent, line)) {
    var prop = this.startNode(), isGenerator = (void 0), isAsync = (void 0), start = (void 0);
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      prop.argument = this.parseMaybeAssign();
      node.properties.push(this.finishNode(prop, "SpreadElement"));
      this.eat(types$1.comma);
      continue
    }
    if (this.options.ecmaVersion >= 6) {
      start = this.storeCurrentPos();
      prop.method = false;
      prop.shorthand = false;
      isGenerator = this.eat(types$1.star);
    }
    this.parsePropertyName(prop);
    if (this.toks.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    if (isDummy(prop.key)) { if (isDummy(this.parseMaybeAssign())) { this.next(); } this.eat(types$1.comma); continue }
    if (this.eat(types$1.colon)) {
      prop.kind = "init";
      prop.value = this.parseMaybeAssign();
    } else if (this.options.ecmaVersion >= 6 && (this.tok.type === types$1.parenL || this.tok.type === types$1.braceL)) {
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
    } else if (this.options.ecmaVersion >= 5 && prop.key.type === "Identifier" &&
               !prop.computed && (prop.key.name === "get" || prop.key.name === "set") &&
               (this.tok.type !== types$1.comma && this.tok.type !== types$1.braceR && this.tok.type !== types$1.eq)) {
      prop.kind = prop.key.name;
      this.parsePropertyName(prop);
      prop.value = this.parseMethod(false);
    } else {
      prop.kind = "init";
      if (this.options.ecmaVersion >= 6) {
        if (this.eat(types$1.eq)) {
          var assign = this.startNodeAt(start);
          assign.operator = "=";
          assign.left = prop.key;
          assign.right = this.parseMaybeAssign();
          prop.value = this.finishNode(assign, "AssignmentExpression");
        } else {
          prop.value = prop.key;
        }
      } else {
        prop.value = this.dummyIdent();
      }
      prop.shorthand = true;
    }
    node.properties.push(this.finishNode(prop, "Property"));
    this.eat(types$1.comma);
  }
  this.popCx();
  if (!this.eat(types$1.braceR)) {
    // If there is no closing brace, make the node span to the start
    // of the next token (this is useful for Tern)
    this.last.end = this.tok.start;
    if (this.options.locations) { this.last.loc.end = this.tok.loc.start; }
  }
  return this.finishNode(node, "ObjectExpression")
};

lp.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseExpression();
      this.expect(types$1.bracketR);
      return
    } else {
      prop.computed = false;
    }
  }
  var key = (this.tok.type === types$1.num || this.tok.type === types$1.string) ? this.parseExprAtom() : this.parseIdent();
  prop.key = key || this.dummyIdent();
};

lp.parsePropertyAccessor = function() {
  if (this.tok.type === types$1.name || this.tok.type.keyword) { return this.parseIdent() }
  if (this.tok.type === types$1.privateId) { return this.parsePrivateIdent() }
};

lp.parseIdent = function() {
  var name = this.tok.type === types$1.name ? this.tok.value : this.tok.type.keyword;
  if (!name) { return this.dummyIdent() }
  if (this.tok.type.keyword) { this.toks.type = types$1.name; }
  var node = this.startNode();
  this.next();
  node.name = name;
  return this.finishNode(node, "Identifier")
};

lp.parsePrivateIdent = function() {
  var node = this.startNode();
  node.name = this.tok.value;
  this.next();
  return this.finishNode(node, "PrivateIdentifier")
};

lp.initFunction = function(node) {
  node.id = null;
  node.params = [];
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = false; }
};

// Convert existing expression atom to assignable pattern
// if possible.

lp.toAssignable = function(node, binding) {
  if (!node || node.type === "Identifier" || (node.type === "MemberExpression" && !binding)) ; else if (node.type === "ParenthesizedExpression") {
    this.toAssignable(node.expression, binding);
  } else if (this.options.ecmaVersion < 6) {
    return this.dummyIdent()
  } else if (node.type === "ObjectExpression") {
    node.type = "ObjectPattern";
    for (var i = 0, list = node.properties; i < list.length; i += 1)
      {
      var prop = list[i];

      this.toAssignable(prop, binding);
    }
  } else if (node.type === "ArrayExpression") {
    node.type = "ArrayPattern";
    this.toAssignableList(node.elements, binding);
  } else if (node.type === "Property") {
    this.toAssignable(node.value, binding);
  } else if (node.type === "SpreadElement") {
    node.type = "RestElement";
    this.toAssignable(node.argument, binding);
  } else if (node.type === "AssignmentExpression") {
    node.type = "AssignmentPattern";
    delete node.operator;
  } else {
    return this.dummyIdent()
  }
  return node
};

lp.toAssignableList = function(exprList, binding) {
  for (var i = 0, list = exprList; i < list.length; i += 1)
    {
    var expr = list[i];

    this.toAssignable(expr, binding);
  }
  return exprList
};

lp.parseFunctionParams = function(params) {
  params = this.parseExprList(types$1.parenR);
  return this.toAssignableList(params, true)
};

lp.parseMethod = function(isGenerator, isAsync) {
  var node = this.startNode(), oldInAsync = this.inAsync, oldInGenerator = this.inGenerator, oldInFunction = this.inFunction;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = !!isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }
  this.inAsync = node.async;
  this.inGenerator = node.generator;
  this.inFunction = true;
  node.params = this.parseFunctionParams();
  node.body = this.parseBlock();
  this.toks.adaptDirectivePrologue(node.body.body);
  this.inAsync = oldInAsync;
  this.inGenerator = oldInGenerator;
  this.inFunction = oldInFunction;
  return this.finishNode(node, "FunctionExpression")
};

lp.parseArrowExpression = function(node, params, isAsync) {
  var oldInAsync = this.inAsync, oldInGenerator = this.inGenerator, oldInFunction = this.inFunction;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }
  this.inAsync = node.async;
  this.inGenerator = false;
  this.inFunction = true;
  node.params = this.toAssignableList(params, true);
  node.expression = this.tok.type !== types$1.braceL;
  if (node.expression) {
    node.body = this.parseMaybeAssign();
  } else {
    node.body = this.parseBlock();
    this.toks.adaptDirectivePrologue(node.body.body);
  }
  this.inAsync = oldInAsync;
  this.inGenerator = oldInGenerator;
  this.inFunction = oldInFunction;
  return this.finishNode(node, "ArrowFunctionExpression")
};

lp.parseExprList = function(close, allowEmpty) {
  this.pushCx();
  var indent = this.curIndent, line = this.curLineStart, elts = [];
  this.next(); // Opening bracket
  while (!this.closes(close, indent + 1, line)) {
    if (this.eat(types$1.comma)) {
      elts.push(allowEmpty ? null : this.dummyIdent());
      continue
    }
    var elt = this.parseMaybeAssign();
    if (isDummy(elt)) {
      if (this.closes(close, indent, line)) { break }
      this.next();
    } else {
      elts.push(elt);
    }
    this.eat(types$1.comma);
  }
  this.popCx();
  if (!this.eat(close)) {
    // If there is no closing brace, make the node span to the start
    // of the next token (this is useful for Tern)
    this.last.end = this.tok.start;
    if (this.options.locations) { this.last.loc.end = this.tok.loc.start; }
  }
  return elts
};

lp.parseAwait = function() {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary();
  return this.finishNode(node, "AwaitExpression")
};

// Acorn: Loose parser
//
// This module provides an alternative parser that exposes that same
// interface as the main module's `parse` function, but will try to
// parse anything as JavaScript, repairing syntax error the best it
// can. There are circumstances in which it will raise an error and
// give up, but they are very rare. The resulting AST will be a mostly
// valid JavaScript AST (as per the [Mozilla parser API][api], except
// that:
//
// - Return outside functions is allowed
//
// - Label consistency (no conflicts, break only to existing labels)
//   is not enforced.
//
// - Bogus Identifier nodes with a name of `"✖"` are inserted whenever
//   the parser got too confused to return anything meaningful.
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
//
// The expected use for this is to *first* try `acorn.parse`, and only
// if that fails switch to the loose parser. The loose parser might
// parse badly indented code incorrectly, so **don't** use it as your
// default parser.
//
// Quite a lot of acorn.js is duplicated here. The alternative was to
// add a *lot* of extra cruft to that file, making it less readable
// and slower. Copying and editing the code allowed me to make
// invasive changes and simplifications without creating a complicated
// tangle.


defaultOptions.tabSize = 4;

function parse(input, options) {
  return LooseParser.parse(input, options)
}

if (!parse) {
	throw new Error('The package \'acorn-loose\' is required to run this library.');
}

const _ACORN_OPTIONS = {ecmaVersion: 2020};

class ParamDescriptor {
	constructor(name, hasDefault, rawName, destructureType=null) {
		this.name = name;
		this.rawName = rawName;
		this.destructureType = destructureType;
		this.hasDefault = hasDefault;
	}
	static fromIdentifierNode(paramNode) {
		// Bare argname.
		return new ParamDescriptor(paramNode.name, false, paramNode.name);
	}
	static fromAssignmentPatternNode(paramNode) {
		// Default arg: arg=val
		const paramIdNode = paramNode.left;
		// TODO: Process paramNode.right (value)
		const paramIdInfo = ParamDescriptor.fromNode(paramIdNode);
		paramIdInfo.hasDefault = true;
		return paramIdInfo;
	}
	static fromArrayPatternNode(paramNode) {
		// Array destructuring. TODO: analyze the expected structure.
		return new ParamDescriptor('', false, paramNode, 'array');
	}
	static fromObjectPatternNode(paramNode) {
		// Object destructuring. TODO: analyze the expected structure.
		return new ParamDescriptor('', false, paramNode, 'object');
	}
	static fromRestElementNode(paramNode) {
		// Spread syntax.
		const identifierInfo = ParamDescriptor.fromNode(paramNode.argument);
		return new ParamDescriptor(identifierInfo.name, false, identifierInfo.rawName, 'spread');
	}
	static fromNode(paramNode) {
		// Because conditional statements aren't error-prone enough.
		const handleNodeFn = ParamDescriptor[`from${paramNode.type}Node`];
		if (handleNodeFn) {
			return handleNodeFn(paramNode);
		} else {
			throw new Error('Unknown parameter type recognized. ' + JSON.stringify(paramNode));
		}
	}
}

class FunctionDescriptor {
	constructor(f) {
		this.f = f;
		this.functionString = FunctionDescriptor.stringify(this.f);
		const anaylsis = FunctionDescriptor.analyzeString(this.functionString, f);
		this.name = anaylsis.name || this.f.name;
		this.isAsync = anaylsis.isAsync;
		this.isArrowFunction = anaylsis.isArrowFunction;
		this.isGenerator = anaylsis.isGenerator;
		this.isClass = anaylsis.isClass;
		this.parameters = anaylsis.parameters;
		this.minArgs = this.f.length;
		this.maxArgs = FunctionDescriptor._getMaxArgs(this.parameters);
	}
	static _extractFunctionNodeAndName(mainNode) {  
		if (['FunctionDeclaration', 'FunctionExpression'].includes(mainNode.type)) {
			return [
				mainNode,
				this._getNameFromIDNode(mainNode.id)
			];
		} else if (mainNode.type == 'ExpressionStatement'
            && mainNode.expression.type == 'ArrowFunctionExpression') {
			return [
				mainNode.expression,
				this._getNameFromIDNode(mainNode.expression.id)
			];
		} else if (mainNode.type == 'ExpressionStatement'
            && mainNode.expression.type == 'CallExpression') {
			// Class methods will be printed like 'methodName(...args) {}' which is 
			// not valid JS on its own. So it it instead a CallExpression followed by
			// a code block ({}). This is why error-tolerant parsing (acorn-loose) is
			// necessary.
			return [
				mainNode.expression,
				this._getNameFromIDNode(mainNode.expression.callee)
			];
		} else {
			throw new Error('Cannot analyze as a function. ' + JSON.stringify(mainNode));
		}
	}
	static analyzeString(functionString, f) {
		if (functionString.replace(/\s/g, '').endsWith('{[nativecode]}')) {
			throw new Error(
				'FunctionDescriptors cannot be created for native functions. '
      + 'Given: ' + functionString);
		} else {
			try {
				const programNode = parse(functionString, _ACORN_OPTIONS);
				const mainNode = programNode.body[0];
				return this.analyzeMainNode(mainNode, f);
			} catch (e) {
				throw new Error('Unable to parse function. ' + functionString + '. ' + e);
			}
		}
	}
	static _getNameFromIDNode(node) {
		return (node && node.type == 'Identifier') ? node.name : '';
	}
	static _isClass(node) {
		return node.type == 'ClassDeclaration';
	}
	static _analyzeClassNode(classNode, cls) {
		const className = this._getNameFromIDNode(classNode.id);
		const constructorNode = classNode.body.body.find(
			v => v.kind == 'constructor'
		);
		let subAnalysis;
		if (constructorNode) {
			subAnalysis = this.analyzeMainNode(constructorNode.value, undefined);
		} else {
			// Assume the constructor was inherited from a superclass.
			if (classNode.superClass) {
				const superClass = cls.__proto__;
				const superString = this.stringify(superClass);
				subAnalysis = this.analyzeString(superString);
			} else {
				// Must not have a constructor at all, so default to 0-arg.
				subAnalysis = this.analyzeString((function(){}).toString());
			}
		}
		return {...subAnalysis, name: className, isClass: true}; 
	}
	static analyzeMainNode(mainNode, f) {
		if (this._isClass(mainNode)) {
			return this._analyzeClassNode(mainNode, f);
		} else {
			const [funcNode, name] = this._extractFunctionNodeAndName(mainNode);
			const params = funcNode.params || funcNode.arguments || [];
			const parameters = params.map(ParamDescriptor.fromNode);
			return {
				isAsync: !!funcNode.async,
				isArrowFunction: !!funcNode.expression,
				isGenerator: !!funcNode.generator,
				isClass: false,
				name,
				parameters,
			};
		}
	}
	static _getMaxArgs(parameters) {
		const hasSpreadParam = parameters.some(p => p.destructureType == 'spread');
		return hasSpreadParam ? Infinity : parameters.length;
	}

	static stringify(f) {
		// Accounts for Function subclasses with overridden toString().
		const boundToString = Function.prototype.toString.bind(f);
		return boundToString().trim();
	}
}

function describeFunction(f) {
	return new FunctionDescriptor(f);
}

describeFunction.FunctionDescriptor = FunctionDescriptor;
describeFunction.ParamDescriptor = ParamDescriptor;

/**
 * A data structure storing the last N values in a time series.
 *
 * It is implemented as a circular array to avoid processing when the time step
 * is incremented.
 *
 * Here's a demonstration with eaach t[n] being an absolute time, | showing
 * the position of the offset, and _ being the default value.
 *
 * "Initial" state storing the first 4 values:
 * - circularBuffer: [|v3 v2 v1 v0]
 * - offset: 0
 *
 * > get(0) = v3
 * > get(1) = v2
 * > get(4) = _
 *
 * After add(v4):
 * - circularBuffer: [v3 v2 v1 | v4]
 * - offset: 3
 *
 * > get(0) = v4
 * > get(1) = v3
 *
 * After setSize(8):
 * - circularBuffer: [|v4 v3 v2 v1 _ _ _ _]
 * - offset: 0
 *
 */
class MemoryBuffer {
    constructor(defaultValueFn) {
        this.defaultValueFn = defaultValueFn;
        this.circularBuffer = [];
        // offset will always be within range, and circularBuffer[offset] is the 
        // most recent value (circularBuffer[offset+1] is the one before that, etc.)
        this.offset = 0;
    }
    get length() {
        return this.circularBuffer.length;
    }
    toInnerIndex(i) {
        return (i + this.offset) % this.length;
    }
    /**
     * Get the ith value of the memory. Note that index 0 is the previous value, not 1.
     */
    get(i) {
        if (i >= this.length) {
            return this.defaultValueFn();
        }
        else {
            const innerIdx = this.toInnerIndex(i);
            return this.circularBuffer[innerIdx];
        }
    }
    /**
     * Add `val` to the array of memory, incrementing the time step. If `length` is zero, this is a no-op.
     *
     * NOTE: to add without discarding old values, always call setSize first.
     */
    add(val) {
        if (this.length) {
            const clone = JSON.parse(JSON.stringify(val)); // TODO: need this?
            // Modular subtraction by 1.
            this.offset = (this.offset + this.length - 1) % this.length;
            this.circularBuffer[this.offset] = clone;
        }
    }
    setSize(size) {
        const newBuffer = [];
        for (let i = 0; i < size; i++) {
            newBuffer.push(this.get(i));
        }
        this.circularBuffer = newBuffer;
        this.offset = 0;
    }
}

class SignalProcessingContext {
    constructor(inputMemory, outputMemory, { windowSize, currentTime, frameIndex, sampleRate, ioConverter, channelIndex = undefined, sampleIndex = undefined }) {
        this.inputMemory = inputMemory;
        this.outputMemory = outputMemory;
        this.maxInputLookback = 0;
        this.maxOutputLookback = 0;
        this.fixedInputLookback = -1;
        this.fixedOutputLookback = -1;
        this.currentTime = currentTime + ((sampleIndex !== null && sampleIndex !== void 0 ? sampleIndex : 0) / sampleRate);
        this.windowSize = windowSize;
        this.sampleIndex = sampleIndex;
        this.channelIndex = channelIndex;
        this.frameIndex = frameIndex;
        this.sampleRate = sampleRate;
        this.numInputs = ioConverter.inputSpec.length;
        this.numOutputs = ioConverter.outputSpec.length;
        this.ioConverter = ioConverter;
    }
    // TODO: consider making this 1-based to make previousInputs(0) be the current.
    previousInputs(t = 0) {
        // Inputs may be float32 which will not represent an int perfectly.
        t = Math.round(t);
        this.maxInputLookback = Math.max(t + 1, this.maxInputLookback);
        return this.inputMemory.get(t);
    }
    previousOutputs(t = 0) {
        // Inputs may be float32 which will not represent an int perfectly.
        t = Math.round(t);
        this.maxOutputLookback = Math.max(t + 1, this.maxOutputLookback);
        return this.outputMemory.get(t);
    }
    setOutputMemorySize(n) {
        // Inputs may be float32 which will not represent an int perfectly.
        n = Math.round(n);
        this.fixedOutputLookback = n;
    }
    setInputMemorySize(n) {
        // Inputs may be float32 which will not represent an int perfectly.
        n = Math.round(n);
        this.fixedInputLookback = n;
    }
    execute(fn, inputs) {
        // Execute the function, making the Context properties and methods available
        // within the user-supplied function.
        const rawOutput = fn.bind(this)(...inputs);
        const outputs = this.ioConverter.normalizeOutputs(rawOutput);
        // If the function tried to access past inputs or force-rezised the memory, 
        // resize.
        SignalProcessingContext.resizeMemory(this.inputMemory, this.maxInputLookback, this.fixedInputLookback);
        SignalProcessingContext.resizeMemory(this.outputMemory, this.maxOutputLookback, this.fixedOutputLookback);
        // Update memory after resizing.
        this.inputMemory.add(inputs);
        this.outputMemory.add(outputs);
        return outputs;
    }
    static resizeMemory(memory, maxLookback, lookbackOverride) {
        if (lookbackOverride > 0) {
            memory.setSize(lookbackOverride);
        }
        else if (maxLookback > memory.length) {
            memory.setSize(maxLookback);
        }
    }
}

const ALL_CHANNELS = -1;
/**
 * A class collecting all current ongoing memory streams. Because some `dimension` settings process channels in parallel (`"none"` and `"time"`), memory streams are indexed by channel.
 */
class SignalProcessingContextFactory {
    constructor({ inputSpec, outputSpec, windowSize, dimension, getFrameIndex, getCurrentTime, sampleRate, }) {
        this.inputHistory = {};
        this.outputHistory = {};
        this.windowSize = windowSize;
        this.sampleRate = sampleRate;
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
        this.getCurrentTime = getCurrentTime;
        this.getFrameIndex = getFrameIndex;
        this.ioConverter = new FrameToSignatureConverter(dimension, inputSpec, outputSpec);
        const genInput = this.getDefaultValueFn({
            dimension,
            windowSize,
            numChannelsPerStream: inputSpec.numChannelsPerStream
        });
        const genOutput = this.getDefaultValueFn({
            dimension,
            windowSize,
            numChannelsPerStream: outputSpec.numChannelsPerStream
        });
        const hasChannelSpecificProcessing = ["all", "channels"].includes(dimension);
        if (hasChannelSpecificProcessing) {
            this.inputHistory[ALL_CHANNELS] = new MemoryBuffer(genInput);
            this.outputHistory[ALL_CHANNELS] = new MemoryBuffer(genOutput);
        }
        else {
            if (!allEqual(inputSpec.numChannelsPerStream)) {
                throw new Error(`Only dimensions 'all' and 'channels' may have inconsistent numbers of input channels. Given dimension=${dimension}, inputSpec=${inputSpec}.`);
            }
            if (!allEqual(outputSpec.numChannelsPerStream)) {
                throw new Error(`Only dimensions 'all' and 'channels' may have inconsistent numbers of output channels. Given dimension=${dimension}, outputSpec=${outputSpec}.`);
            }
            // Each channel is processed the same.
            for (let c = 0; c < inputSpec.numChannelsPerStream[0]; c++) {
                this.inputHistory[c] = new MemoryBuffer(genInput);
            }
            for (let c = 0; c < outputSpec.numChannelsPerStream[0]; c++) {
                this.outputHistory[c] = new MemoryBuffer(genOutput);
            }
        }
    }
    getDefaultValueFn({ dimension, windowSize, numChannelsPerStream }) {
        return function genValue() {
            const defaultValue = [];
            for (let i = 0; i < numChannelsPerStream.length; i++) {
                defaultValue.push(generateZeroInput(dimension, windowSize, numChannelsPerStream[i]));
            }
            return defaultValue;
        };
    }
    getContext({ channelIndex = ALL_CHANNELS, sampleIndex = undefined } = {}) {
        const inputMemory = this.inputHistory[channelIndex];
        const outputMemory = this.outputHistory[channelIndex];
        return new SignalProcessingContext(inputMemory, outputMemory, {
            windowSize: this.windowSize,
            channelIndex,
            sampleIndex,
            ioConverter: this.ioConverter,
            sampleRate: this.sampleRate,
            frameIndex: this.getFrameIndex(),
            currentTime: this.getCurrentTime()
        });
    }
}

/* Serialization */
function serializeWorkletMessage(f, { dimension, inputSpec, outputSpec, windowSize }) {
    const traceback = {};
    Error.captureStackTrace(traceback);
    return {
        fnString: f.toString(),
        dimension,
        inputSpec,
        outputSpec,
        windowSize,
        // @ts-ignore
        tracebackString: traceback['stack']
    };
}

const FUNCTION_WORKLET_NAME = "function-worklet";

class AudioExecutionContext extends ToStringAndUUID {
    constructor(fn, dimension) {
        super();
        this.fn = fn;
        this.dimension = dimension;
        this.applyToChunk = getProcessingFunction(dimension);
    }
    processAudioFrame(inputChunks, outputChunks, contextFactory) {
        return this.applyToChunk(this.fn, inputChunks, outputChunks, contextFactory);
    }
    /**
     * Guess the number of output channels by applying the function to a fake input.
     */
    inferNumOutputChannels(inputSpec, outputSpec, windowSize = 128) {
        const createChunk = (numChannels) => range(numChannels).map(_ => new Float32Array(windowSize));
        const inputChunks = inputSpec.numChannelsPerStream.map(createChunk);
        // The output may have more channels than the input, so be flexible when 
        // testing it so as to not break the implementation.
        const maxChannelsPerOutput = range(outputSpec.length).fill(constants.MAX_CHANNELS);
        const outputChunks = maxChannelsPerOutput.map(createChunk);
        const contextFactory = new SignalProcessingContextFactory({
            sampleRate: this.audioContext.sampleRate,
            getCurrentTime: () => this.audioContext.currentTime,
            getFrameIndex: () => 0,
            inputSpec,
            outputSpec,
            windowSize,
            dimension: this.dimension
        });
        // The returned value will be the number of new output channels, if it's 
        // different from the provided buffer size, otherwise undefined.
        const numChannelsPerOutput = this.processAudioFrame(inputChunks, outputChunks, contextFactory);
        return numChannelsPerOutput !== null && numChannelsPerOutput !== void 0 ? numChannelsPerOutput : outputSpec.numChannelsPerStream;
    }
    static create(fn, { useWorklet, dimension, inputSpec, outputSpec, windowSize, }) {
        if (useWorklet) {
            return new this._.WorkletExecutionContext(fn, {
                dimension,
                inputSpec,
                outputSpec
            });
        }
        else {
            return new this._.ScriptProcessorExecutionContext(fn, {
                dimension,
                inputSpec,
                outputSpec,
                windowSize,
            });
        }
    }
}
class WorkletExecutionContext extends AudioExecutionContext {
    constructor(fn, { dimension, inputSpec, outputSpec }) {
        super(fn, dimension);
        if (!this.config.state.workletIsAvailable) {
            throw new Error("Can't use worklet for processing because the worklet failed to load. Verify the `workletPath` configuration setting is set correctly and the file is available.");
        }
        // TODO: fix
        if (outputSpec.hasDefaultNumChannels) {
            const numChannelsPerOutput = this.inferNumOutputChannels(inputSpec, outputSpec);
            outputSpec = new StreamSpec(Object.assign(Object.assign({}, outputSpec), { numChannelsPerStream: numChannelsPerOutput }));
        }
        const worklet = new AudioWorkletNode(this.audioContext, FUNCTION_WORKLET_NAME, {
            numberOfInputs: inputSpec.length,
            outputChannelCount: outputSpec.numChannelsPerStream,
            numberOfOutputs: outputSpec.length
        });
        // TODO: figure this out.
        // @ts-ignore No index signature.
        worklet['__numInputChannels'] = inputSpec.numChannelsPerStream[0];
        // @ts-ignore No index signature.
        worklet['__numOutputChannels'] = outputSpec.numChannelsPerStream[0];
        const { inputs, outputs } = this._.WorkletExecutionContext.defineAudioGraph(worklet, {
            inputSpec,
            outputSpec,
        });
        // NOTE: beginning execution of the user-supplied function must be
        // performed *after* the AudioWorkletNode has all its inputs 
        // connected, otherwise the processor may run process() with an
        // empty input array.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1629478
        const serializedFunction = serializeWorkletMessage(fn, {
            dimension,
            inputSpec,
            outputSpec,
            windowSize: 128 // TODO: make this flexible.
        });
        worklet.port.postMessage(serializedFunction);
        this.inputs = inputs;
        this.outputs = outputs;
    }
    static defineAudioGraph(workletNode, { inputSpec, outputSpec, }) {
        const inputNodes = [];
        const outputNodes = [];
        for (const [i, numChannels] of enumerate(inputSpec.numChannelsPerStream)) {
            const input = new GainNode(this.audioContext, {
                channelCount: numChannels,
                // Force channelCount even if the input has more / fewer channels.
                channelCountMode: "explicit"
            });
            input.connect(workletNode, 0, i);
            inputNodes.push(input);
        }
        for (const [i, numChannels] of enumerate(outputSpec.numChannelsPerStream)) {
            const output = new GainNode(this.audioContext, {
                channelCount: numChannels,
                // Force channelCount even if the input has more / fewer channels.
                channelCountMode: "explicit"
            });
            workletNode.connect(output, i, 0);
            outputNodes.push(output);
        }
        // TODO: implement outputs.
        return { inputs: inputNodes, outputs: outputNodes };
    }
}
class ScriptProcessorExecutionContext extends AudioExecutionContext {
    constructor(fn, { dimension, inputSpec, outputSpec, windowSize, }) {
        super(fn, dimension);
        this.fn = fn;
        if (inputSpec.totalNumChannels > constants.MAX_CHANNELS) {
            throw new Error(`When using the ScriptProcessorNode, the total number of input channels must be less than ${constants.MAX_CHANNELS}. Given input spec with channelsPerStream=${inputSpec.numChannelsPerStream}.`);
        }
        if (outputSpec.totalNumChannels > constants.MAX_CHANNELS) {
            throw new Error(`When using the ScriptProcessorNode, the total number of output channels must be less than ${constants.MAX_CHANNELS}. Given output spec with channelsPerStream=${outputSpec.numChannelsPerStream}.`);
        }
        if (outputSpec.hasDefaultNumChannels) {
            const numChannelsPerOutput = this.inferNumOutputChannels(inputSpec, outputSpec);
            outputSpec = new StreamSpec(Object.assign(Object.assign({}, outputSpec), { numChannelsPerStream: numChannelsPerOutput }));
        }
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
        const processor = createScriptProcessorNode(this.audioContext, windowSize !== null && windowSize !== void 0 ? windowSize : 0, // The best value will be chosen if == 0
        inputSpec.totalNumChannels, outputSpec.totalNumChannels);
        this.windowSize = processor.bufferSize;
        const { inputs, outputs } = this._.ScriptProcessorExecutionContext.defineAudioGraph(processor, { inputSpec, outputSpec });
        this.defineAudioProcessHandler(processor);
        this.inputs = inputs;
        this.outputs = outputs;
    }
    static defineAudioGraph(processorNode, { inputSpec, outputSpec }) {
        const inputNodes = [];
        const merger = this.audioContext.createChannelMerger(inputSpec.totalNumChannels);
        // Merger -> Processor
        merger.connect(processorNode);
        let startChannel = 0;
        for (const numChannels of inputSpec.numChannelsPerStream) {
            const input = new GainNode(this.audioContext, { channelCount: numChannels });
            // Flattened channel arrangement:
            // [0_left, 0_right, 1_left, 1_right, 2_left, 2_right] 
            for (const j of range(numChannels)) {
                // Input -> Merger
                const destinationChannel = startChannel + j;
                // TODO: is this actually connecting the channels properly? It might 
                // just be duplicating the channel across the merger inputs.
                input.connect(merger, 0, destinationChannel);
            }
            startChannel += numChannels;
            inputNodes.push(input);
        }
        // TODO: refactor this logic into a general method for expanding / flattening channels.
        const outputNodes = [];
        const outputSplitter = this.audioContext.createChannelSplitter(outputSpec.totalNumChannels);
        processorNode.connect(outputSplitter);
        startChannel = 0;
        for (const numChannels of outputSpec.numChannelsPerStream) {
            const outputMerger = this.audioContext.createChannelMerger(numChannels);
            for (const j of range(numChannels)) {
                outputSplitter.connect(outputMerger, startChannel + j, j);
            }
            startChannel += numChannels;
            outputNodes.push(outputMerger);
        }
        return {
            inputs: inputNodes,
            outputs: outputNodes
        };
    }
    defineAudioProcessHandler(processor) {
        let frameIndex = 0;
        const contextFactory = new SignalProcessingContextFactory({
            sampleRate: this.audioContext.sampleRate,
            getCurrentTime: () => this.audioContext.currentTime,
            getFrameIndex: () => frameIndex,
            inputSpec: this.inputSpec,
            outputSpec: this.outputSpec,
            windowSize: this.windowSize,
            dimension: this.dimension
        });
        const handler = (event) => {
            try {
                this.processAudioEvent(event, contextFactory);
                frameIndex++;
            }
            catch (e) {
                processor.removeEventListener(constants.EVENT_AUDIOPROCESS, handler);
                e instanceof Disconnect || console.error(e);
            }
        };
        processor.addEventListener(constants.EVENT_AUDIOPROCESS, handler);
    }
    /**
     * Split out a flattened array of channels into separate inputs/outputs.
     */
    groupChannels(flatChannels, channelsPerGroup) {
        const groups = [];
        let startIndex = 0;
        for (let i = 0; i < channelsPerGroup.length; i++) {
            const input = [];
            for (let c = 0; c < channelsPerGroup[i]; c++) {
                const flatIndex = startIndex + c;
                input.push(flatChannels[flatIndex]);
            }
            groups.push(input);
            startIndex += channelsPerGroup[i];
        }
        return groups;
    }
    processAudioEvent(event, contextFactory) {
        const inputChunk = [];
        const outputChunk = [];
        for (let c = 0; c < event.inputBuffer.numberOfChannels; c++) {
            inputChunk.push(event.inputBuffer.getChannelData(c));
        }
        for (let c = 0; c < event.outputBuffer.numberOfChannels; c++) {
            outputChunk.push(event.outputBuffer.getChannelData(c));
        }
        const inputChunks = this.groupChannels(inputChunk, this.inputSpec.numChannelsPerStream);
        const outputChunks = this.groupChannels(outputChunk, this.outputSpec.numChannelsPerStream);
        return this.processAudioFrame(inputChunks, outputChunks, contextFactory);
    }
}
class AudioTransformComponent extends BaseComponent {
    constructor(fn, 
    // @ts-ignore Could be initialized with different subtype.
    { dimension = "none", windowSize = undefined, inputSpec, outputSpec, useWorklet } = {}) {
        super();
        this.fn = fn;
        // Properties.
        if (inputSpec == undefined) {
            const names = this.inferParamNames(fn);
            inputSpec = new StreamSpec({ names });
        }
        else if (inputSpec.hasNumberedNames) {
            inputSpec.names = this.inferParamNames(fn, inputSpec);
        }
        outputSpec !== null && outputSpec !== void 0 ? outputSpec : (outputSpec = new StreamSpec({ numStreams: 1 }));
        useWorklet !== null && useWorklet !== void 0 ? useWorklet : (useWorklet = this.config.useWorkletByDefault);
        // Handles audio graph creation.
        this.executionContext = this._.AudioExecutionContext.create(fn, {
            dimension,
            windowSize,
            inputSpec,
            outputSpec,
            useWorklet,
        });
        // I/O.
        for (const [i, name] of enumerate(inputSpec.names)) {
            const propName = "$" + name;
            // @ts-ignore No index signature.
            this[propName] = this.defineAudioInput(propName, this.executionContext.inputs[i]);
            // Numbered alias, only present in .inputs.
            // @ts-ignore No index signature.
            this.defineInputAlias(i, this[propName]);
        }
        for (const [i, name] of enumerate(outputSpec.names)) {
            const propName = "$" + name;
            // @ts-ignore No index signature.
            this[propName] = this.defineAudioOutput(propName, this.executionContext.outputs[i]);
            // Numbered alias, only present in .outputs
            // @ts-ignore No index signature.
            this.defineOutputAlias(i, this[propName]);
        }
        // TODO: this should be automatic, aliases should not count.
        if (inputSpec.length == 1) {
            // @ts-ignore No index signature.
            this.setDefaultInput(this["$" + inputSpec.names[0]]);
        }
        if (outputSpec.length == 1) {
            // @ts-ignore No index signature.
            this.setDefaultOutput(this["$" + outputSpec.names[0]]);
        }
        this.output = this.defineOutputAlias('output', this.outputs[0]);
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
    }
    inferParamNames(fn, inputSpec) {
        let numInputs = inputSpec === null || inputSpec === void 0 ? void 0 : inputSpec.length;
        const maxSafeInputs = Math.floor(constants.MAX_CHANNELS / constants.DEFAULT_NUM_CHANNELS);
        let descriptor;
        try {
            descriptor = describeFunction(fn);
        }
        catch (e) {
            numInputs !== null && numInputs !== void 0 ? numInputs : (numInputs = maxSafeInputs);
            console.warn(`Unable to infer the input signature from the given function. Pass inputNames directly in the ${this._className} constructor instead. Defaulting to ${numInputs} inputs, named by their index.\nOriginal error: ${e.message}`);
            return range(numInputs);
        }
        // The node only supports a limited number of channels, so we can only 
        // use the first few.
        if (numInputs == undefined) {
            if (descriptor.maxArgs > maxSafeInputs) {
                console.warn(`Given a function that takes up to ${descriptor.maxArgs} inputs.\nBecause only ${constants.MAX_CHANNELS} channels can be processed by each WebAudio node and each input has ${constants.DEFAULT_NUM_CHANNELS} channels, only values for the first ${maxSafeInputs} inputs will be used. To suppress this warning, pass numInputs directly in the ${this._className} constructor.`);
                numInputs = maxSafeInputs;
            }
            else {
                numInputs = descriptor.maxArgs;
            }
        }
        else if (numInputs < descriptor.minArgs) {
            throw new Error(`Given a function with ${descriptor.minArgs} required parameters, but expected no more than the supplied value of numInputs (${numInputs}) to ensure inputs are not undefined during signal processing.`);
        }
        return range(numInputs).map(i => {
            const paramDescriptor = descriptor.parameters[i];
            // Parameters may be unnamed if they are object- or array-destructured.
            return (paramDescriptor === null || paramDescriptor === void 0 ? void 0 : paramDescriptor.name) || i;
        });
    }
    withInputs(...inputs) {
        var _a;
        let inputDict = {};
        if ((_a = inputs[0]) === null || _a === void 0 ? void 0 : _a.connect) { // instanceof Connectable
            if (inputs.length > this.inputs.length) {
                throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this.inputs.length} but got ${inputs.length}.`);
            }
            for (let i = 0; i < inputs.length; i++) {
                inputDict[i] = inputs[i];
            }
        }
        else {
            inputDict = inputs[0];
        }
        super.withInputs(inputDict);
        return this;
    }
}

var __classPrivateFieldGet$6 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AudioRateSignalSampler_instances, _AudioRateSignalSampler_setInterval;
// TODO: make this multi-channel.
class AudioRateSignalSampler extends BaseComponent {
    // Utility for converting an audio-rate signal into a control signal.
    constructor(samplePeriodMs) {
        super();
        _AudioRateSignalSampler_instances.add(this);
        samplePeriodMs !== null && samplePeriodMs !== void 0 ? samplePeriodMs : (samplePeriodMs = this.config.defaultSamplePeriodMs);
        this._analyzer = this.audioContext.createAnalyser();
        // Inputs
        this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs).ofType(Number);
        this.audioInput = this.defineAudioInput('audioInput', this._analyzer);
        this.setDefaultInput(this.audioInput);
        // Output
        this.controlOutput = this.defineControlOutput('controlOutput').ofType(Number);
        this.preventIOOverwrites();
    }
    getCurrentSignalValue() {
        const dataArray = new Float32Array(1);
        this._analyzer.getFloatTimeDomainData(dataArray);
        return dataArray[0];
    }
    stop() {
        // TODO: figure out how to actually stop this...
        window.clearInterval(this.interval);
    }
    inputAdded(source) {
        var _a;
        if (this.interval) {
            throw new Error("AudioToControlConverter can only have one input.");
        }
        __classPrivateFieldGet$6(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, (_a = this.samplePeriodMs.value) !== null && _a !== void 0 ? _a : this.config.defaultSamplePeriodMs);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.samplePeriodMs) {
            this.stop();
            __classPrivateFieldGet$6(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, newValue);
        }
    }
}
_AudioRateSignalSampler_instances = new WeakSet(), _AudioRateSignalSampler_setInterval = function _AudioRateSignalSampler_setInterval(period) {
    this.interval = window.setInterval(() => {
        try {
            const signal = this.getCurrentSignalValue();
            this.controlOutput.setValue(signal);
        }
        catch (e) {
            this.stop();
            if (!(e instanceof Disconnect)) {
                throw e;
            }
        }
    }, period);
};

class MidiListener extends ToStringAndUUID {
    constructor(listener, listenerMap) {
        super();
        this.listener = listener;
        this.listenerMap = listenerMap;
        MidiState.connect();
        listenerMap[this._uuid] = listener;
    }
    remove() {
        delete this.listenerMap[this._uuid];
    }
}
class MidiState {
    static connect() {
        if (this.isInitialized) {
            return Promise.resolve();
        }
        else {
            // Avoid race conditions by requesting access only once.
            this.isInitialized = true;
            return navigator.requestMIDIAccess().then(access => {
                this.onMidiAccessChange(access);
                access.onstatechange = this.onMidiAccessChange.bind(this, access);
            });
        }
    }
    static onMidiAccessChange(access, event) {
        if (!(event instanceof MIDIConnectionEvent))
            return;
        for (const listener of Object.values(this.accessListeners)) {
            listener(access, event);
        }
        for (const input of access.inputs.values()) {
            input.onmidimessage = MidiState.onMidiMessage.bind(this, input);
        }
    }
    static onMidiMessage(midiInput, event) {
        for (const listener of Object.values(this.messageListeners)) {
            listener(midiInput, event);
        }
    }
}
MidiState.accessListeners = {};
MidiState.messageListeners = {};
MidiState.isInitialized = false;
// Utility for listening to current state of MIDI devices. There are many MIDI 
// listeners but only one MIDI state.
class MidiAccessListener extends MidiListener {
    constructor(onMidiAccessChange) {
        super(onMidiAccessChange, MidiState.accessListeners);
        this.onMidiAccessChange = onMidiAccessChange;
    }
}
class MidiMessageListener extends MidiListener {
    constructor(onMidiMessage) {
        super(onMidiMessage, MidiState.messageListeners);
        this.onMidiMessage = onMidiMessage;
    }
}

var jquery_contextMenu = {exports: {}};

/*!
 * 
 * jQuery contextMenu v3.0.0-beta.2 - Plugin for simple contextMenu handling
 * 
 * Version: v3.0.0-beta.2
 * 
 * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)
 * 
 * Web: http://swisnl.github.io/jQuery-contextMenu/
 * 
 * Copyright (c) 2011-2018 SWIS BV and contributors
 * 
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 * 
 * Date: 2018-03-16T11:21:00.512Z
 * 
 * 
 */

(function (module, exports) {
	(function webpackUniversalModuleDefinition(root, factory) {
		module.exports = factory();
	})(typeof self !== 'undefined' ? self : commonjsGlobal, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId]) {
	/******/ 			return installedModules[moduleId].exports;
	/******/ 		}
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			i: moduleId,
	/******/ 			l: false,
	/******/ 			exports: {}
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.l = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// define getter function for harmony exports
	/******/ 	__webpack_require__.d = function(exports, name, getter) {
	/******/ 		if(!__webpack_require__.o(exports, name)) {
	/******/ 			Object.defineProperty(exports, name, {
	/******/ 				configurable: false,
	/******/ 				enumerable: true,
	/******/ 				get: getter
	/******/ 			});
	/******/ 		}
	/******/ 	};
	/******/
	/******/ 	// getDefaultExport function for compatibility with non-harmony modules
	/******/ 	__webpack_require__.n = function(module) {
	/******/ 		var getter = module && module.__esModule ?
	/******/ 			function getDefault() { return module['default']; } :
	/******/ 			function getModuleExports() { return module; };
	/******/ 		__webpack_require__.d(getter, 'a', getter);
	/******/ 		return getter;
	/******/ 	};
	/******/
	/******/ 	// Object.prototype.hasOwnProperty.call
	/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(__webpack_require__.s = 2);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var ContextMenuItemTypes = {
	  simple: '',

	  text: 'text',

	  textarea: 'textarea',

	  checkbox: 'checkbox',

	  radio: 'radio',

	  select: 'select',

	  html: 'html',

	  separator: 'cm_separator',

	  submenu: 'sub'
	};

	exports.default = ContextMenuItemTypes;

	/***/ }),
	/* 1 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _position = __webpack_require__(7);

	exports.default = {
	    selector: null,

	    appendTo: null,

	    trigger: 'right',

	    autoHide: false,

	    delay: 200,

	    reposition: true,

	    hideOnSecondTrigger: false,

	    selectableSubMenu: false,

	    className: '',

	    classNames: {
	        hover: 'context-menu-hover',
	        disabled: 'context-menu-disabled',
	        visible: 'context-menu-visible',
	        notSelectable: 'context-menu-not-selectable',

	        icon: 'context-menu-icon',
	        iconEdit: 'context-menu-icon-edit',
	        iconCut: 'context-menu-icon-cut',
	        iconCopy: 'context-menu-icon-copy',
	        iconPaste: 'context-menu-icon-paste',
	        iconDelete: 'context-menu-icon-delete',
	        iconAdd: 'context-menu-icon-add',
	        iconQuit: 'context-menu-icon-quit',
	        iconLoadingClass: 'context-menu-icon-loading'
	    },

	    zIndex: 1,

	    animation: {
	        duration: 50,
	        show: 'slideDown',
	        hide: 'slideUp'
	    },

	    events: {
	        show: $.noop,
	        hide: $.noop,
	        activated: $.noop
	    },

	    callback: null,

	    items: {},

	    build: false,

	    types: {},

	    determinePosition: _position.determinePosition,

	    position: _position.position,

	    positionSubmenu: _position.positionSubmenu
	};

	/***/ }),
	/* 2 */
	/***/ (function(module, exports, __webpack_require__) {


	__webpack_require__(3);

	var _ContextMenu = __webpack_require__(4);

	var _ContextMenu2 = _interopRequireDefault(_ContextMenu);

	var _ContextMenuItemTypes = __webpack_require__(0);

	var _ContextMenuItemTypes2 = _interopRequireDefault(_ContextMenuItemTypes);

	var _contextMenuFunction = __webpack_require__(10);

	var _contextMenuFunction2 = _interopRequireDefault(_contextMenuFunction);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var manager = new _ContextMenu2.default();

	var contextMenu = function contextMenu(operation, options) {
	    manager.execute(operation, options);
	};

	contextMenu.getInputValues = function (currentMenuData, data) {
	    return manager.getInputValues(currentMenuData, data);
	};
	contextMenu.setInputValues = function (currentMenuData, data) {
	    return manager.getInputValues(currentMenuData, data);
	};
	contextMenu.fromMenu = function (element) {
	    return manager.html5builder.fromMenu(element);
	};

	contextMenu.defaults = manager.defaults;
	contextMenu.types = manager.defaults.types;
	contextMenu.manager = manager;

	contextMenu.handle = manager.handler;
	contextMenu.operations = manager.operations;
	contextMenu.menus = manager.menus;
	contextMenu.namespaces = manager.namespaces;

	$.fn.contextMenu = _contextMenuFunction2.default;
	$.contextMenu = contextMenu;

	module.exports = { ContextMenu: _ContextMenu2.default, ContextMenuItemTypes: _ContextMenuItemTypes2.default };

	/***/ }),
	/* 3 */
	/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

	/***/ }),
	/* 4 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _ContextMenuOperations = __webpack_require__(5);

	var _ContextMenuOperations2 = _interopRequireDefault(_ContextMenuOperations);

	var _defaults = __webpack_require__(1);

	var _defaults2 = _interopRequireDefault(_defaults);

	var _ContextMenuHtml5Builder = __webpack_require__(8);

	var _ContextMenuHtml5Builder2 = _interopRequireDefault(_ContextMenuHtml5Builder);

	var _ContextMenuEventHandler = __webpack_require__(9);

	var _ContextMenuEventHandler2 = _interopRequireDefault(_ContextMenuEventHandler);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextMenu = function () {
	    function ContextMenu() {
	        _classCallCheck(this, ContextMenu);

	        this.html5builder = new _ContextMenuHtml5Builder2.default();
	        this.defaults = _defaults2.default;
	        this.handler = new _ContextMenuEventHandler2.default();
	        this.operations = new _ContextMenuOperations2.default();
	        this.namespaces = {};
	        this.initialized = false;
	        this.menus = {};
	        this.counter = 0;
	    }

	    _createClass(ContextMenu, [{
	        key: 'execute',
	        value: function execute(operation, options) {
	            var normalizedArguments = this.normalizeArguments(operation, options);
	            operation = normalizedArguments.operation;
	            options = normalizedArguments.options;

	            switch (operation) {
	                case 'update':
	                    this.update(options);
	                    break;

	                case 'create':
	                    this.create(options);
	                    break;

	                case 'destroy':
	                    this.destroy(options);
	                    break;

	                case 'html5':
	                    this.html5(options);
	                    break;

	                default:
	                    throw new Error('Unknown operation "' + operation + '"');
	            }

	            return this;
	        }
	    }, {
	        key: 'html5',
	        value: function html5(options) {
	            options = this.buildOptions(options);

	            var menuItemSupport = 'contextMenu' in document.body && 'HTMLMenuItemElement' in window;

	            if (!menuItemSupport || typeof options === 'boolean' && options === true) {
	                $('menu[type="context"]').each(function () {
	                    if (this.id) {
	                        $.contextMenu({
	                            selector: '[contextmenu=' + this.id + ']',
	                            items: $.contextMenu.fromMenu(this)
	                        });
	                    }
	                }).css('display', 'none');
	            }
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy(options) {
	            var _this = this;

	            options = this.buildOptions(options);

	            var $visibleMenu = void 0;
	            if (options._hasContext) {
	                var context = options.context;

	                Object.keys(this.menus).forEach(function (ns) {
	                    var o = _this.menus[ns];

	                    if (!o) {
	                        return true;
	                    }

	                    if (!$(context).is(o.selector)) {
	                        return true;
	                    }

	                    $visibleMenu = $('.context-menu-list').filter(':visible');
	                    if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is($(o.context).find(o.selector))) {
	                        $visibleMenu.trigger('contextmenu:hide', { force: true });
	                    }

	                    if (_this.menus[o.ns].$menu) {
	                        _this.menus[o.ns].$menu.remove();
	                    }
	                    delete _this.menus[o.ns];

	                    $(o.context).off(o.ns);
	                    return true;
	                });
	            } else if (!options.selector) {
	                $(document).off('.contextMenu .contextMenuAutoHide');

	                Object.keys(this.menus).forEach(function (ns) {
	                    var o = _this.menus[ns];
	                    $(o.context).off(o.ns);
	                });

	                this.namespaces = {};
	                this.menus = {};
	                this.counter = 0;
	                this.initialized = false;

	                $('#context-menu-layer, .context-menu-list').remove();
	            } else if (this.namespaces[options.selector]) {
	                $visibleMenu = $('.context-menu-list').filter(':visible');
	                if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is(options.selector)) {
	                    $visibleMenu.trigger('contextmenu:hide', { force: true });
	                }

	                if (this.menus[this.namespaces[options.selector]].$menu) {
	                    this.menus[this.namespaces[options.selector]].$menu.remove();
	                }
	                delete this.menus[this.namespaces[options.selector]];

	                $(document).off(this.namespaces[options.selector]);
	            }
	            this.handler.$currentTrigger = null;
	        }
	    }, {
	        key: 'create',
	        value: function create(options) {
	            options = this.buildOptions(options);

	            if (!options.selector) {
	                throw new Error('No selector specified');
	            }

	            if (options.selector.match(/.context-menu-(list|item|input)($|\s)/)) {
	                throw new Error('Cannot bind to selector "' + options.selector + '" as it contains a reserved className');
	            }
	            if (!options.build && (!options.items || $.isEmptyObject(options.items))) {
	                throw new Error('No Items specified');
	            }
	            this.counter++;
	            options.ns = '.contextMenu' + this.counter;
	            if (!options._hasContext) {
	                this.namespaces[options.selector] = options.ns;
	            }
	            this.menus[options.ns] = options;

	            if (!options.trigger) {
	                options.trigger = 'right';
	            }

	            if (!this.initialized) {
	                var itemClick = options.itemClickEvent === 'click' ? 'click.contextMenu' : 'mouseup.contextMenu';
	                var contextMenuItemObj = {
	                    'contextmenu:focus.contextMenu': this.handler.focusItem,
	                    'contextmenu:blur.contextMenu': this.handler.blurItem,
	                    'contextmenu.contextMenu': this.handler.abortevent,
	                    'mouseenter.contextMenu': this.handler.itemMouseenter,
	                    'mouseleave.contextMenu': this.handler.itemMouseleave
	                };
	                contextMenuItemObj[itemClick] = this.handler.itemClick;

	                $(document).on({
	                    'contextmenu:hide.contextMenu': this.handler.hideMenu,
	                    'prevcommand.contextMenu': this.handler.prevItem,
	                    'nextcommand.contextMenu': this.handler.nextItem,
	                    'contextmenu.contextMenu': this.handler.abortevent,
	                    'mouseenter.contextMenu': this.handler.menuMouseenter,
	                    'mouseleave.contextMenu': this.handler.menuMouseleave
	                }, '.context-menu-list').on('mouseup.contextMenu', '.context-menu-input', this.handler.inputClick).on(contextMenuItemObj, '.context-menu-item');

	                this.initialized = true;
	            }

	            options.context.on('contextmenu' + options.ns, options.selector, options, this.handler.contextmenu);

	            switch (options.trigger) {
	                case 'hover':
	                    options.context.on('mouseenter' + options.ns, options.selector, options, this.handler.mouseenter).on('mouseleave' + options.ns, options.selector, options, this.handler.mouseleave);
	                    break;

	                case 'left':
	                    options.context.on('click' + options.ns, options.selector, options, this.handler.click);
	                    break;
	                case 'touchstart':
	                    options.context.on('touchstart' + options.ns, options.selector, options, this.handler.click);
	                    break;
	            }

	            if (!options.build) {
	                this.operations.create(null, options);
	            }
	        }
	    }, {
	        key: 'update',
	        value: function update(options) {
	            var _this2 = this;

	            options = this.buildOptions(options);

	            if (options._hasContext) {
	                this.operations.update(null, $(options.context).data('contextMenu'), $(options.context).data('contextMenuRoot'));
	            } else {
	                Object.keys(this.menus).forEach(function (menu) {
	                    _this2.operations.update(null, _this2.menus[menu]);
	                });
	            }
	        }
	    }, {
	        key: 'buildOptions',
	        value: function buildOptions(userOptions) {
	            if (typeof userOptions === 'string') {
	                userOptions = { selector: userOptions };
	            }

	            var options = $.extend(true, { manager: this }, this.defaults, userOptions);

	            if (!options.context || !options.context.length) {
	                options.context = $(document);
	                options._hasContext = false;
	            } else {
	                options.context = $(options.context).first();
	                options._hasContext = !$(options.context).is($(document));
	            }
	            return options;
	        }
	    }, {
	        key: 'normalizeArguments',
	        value: function normalizeArguments(operation, options) {
	            if (typeof operation !== 'string') {
	                options = operation;
	                operation = 'create';
	            }

	            if (typeof options === 'string') {
	                options = { selector: options };
	            } else if (typeof options === 'undefined') {
	                options = {};
	            }
	            return { operation: operation, options: options };
	        }
	    }, {
	        key: 'setInputValues',
	        value: function setInputValues(contextMenuData, data) {
	            if (typeof data === 'undefined') {
	                data = {};
	            }

	            $.each(contextMenuData.inputs, function (key, item) {
	                switch (item.type) {
	                    case 'text':
	                    case 'textarea':
	                        item.value = data[key] || '';
	                        break;

	                    case 'checkbox':
	                        item.selected = !!data[key];
	                        break;

	                    case 'radio':
	                        item.selected = (data[item.radio] || '') === item.value;
	                        break;

	                    case 'select':
	                        item.selected = data[key] || '';
	                        break;
	                }
	            });
	        }
	    }, {
	        key: 'getInputValues',
	        value: function getInputValues(contextMenuData, data) {
	            if (typeof data === 'undefined') {
	                data = {};
	            }

	            $.each(contextMenuData.inputs, function (key, item) {
	                switch (item.type) {
	                    case 'text':
	                    case 'textarea':
	                    case 'select':
	                        data[key] = item.$input.val();
	                        break;

	                    case 'checkbox':
	                        data[key] = item.$input.prop('checked');
	                        break;

	                    case 'radio':
	                        if (item.$input.prop('checked')) {
	                            data[item.radio] = item.value;
	                        }
	                        break;
	                }
	            });

	            return data;
	        }
	    }]);

	    return ContextMenu;
	}();

	exports.default = ContextMenu;

	/***/ }),
	/* 5 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _ContextMenuHelper = __webpack_require__(6);

	var _ContextMenuHelper2 = _interopRequireDefault(_ContextMenuHelper);

	var _ContextMenuItemTypes = __webpack_require__(0);

	var _ContextMenuItemTypes2 = _interopRequireDefault(_ContextMenuItemTypes);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextMenuOperations = function () {
	    function ContextMenuOperations() {
	        _classCallCheck(this, ContextMenuOperations);

	        return this;
	    }

	    _createClass(ContextMenuOperations, [{
	        key: 'show',
	        value: function show(e, menuData, x, y) {
	            var $trigger = $(this);
	            var css = {};

	            $('#context-menu-layer').trigger('mousedown');

	            menuData.$trigger = $trigger;

	            if (menuData.events.show.call($trigger, e, menuData) === false) {
	                menuData.manager.handler.$currentTrigger = null;
	                return;
	            }

	            var hasVisibleItems = menuData.manager.operations.update.call($trigger, e, menuData);

	            if (hasVisibleItems === false) {
	                menuData.manager.handler.$currentTrigger = null;
	                return;
	            }

	            menuData.position.call($trigger, e, menuData, x, y);

	            if (menuData.zIndex) {
	                var additionalZValue = menuData.zIndex;

	                if (typeof menuData.zIndex === 'function') {
	                    additionalZValue = menuData.zIndex.call($trigger, menuData);
	                }
	                css.zIndex = _ContextMenuHelper2.default.zindex($trigger) + additionalZValue;
	            }

	            menuData.manager.operations.layer.call(menuData.$menu, e, menuData, css.zIndex);

	            menuData.$menu.find('ul').css('zIndex', css.zIndex + 1);

	            menuData.$menu.css(css)[menuData.animation.show](menuData.animation.duration, function () {
	                $trigger.trigger('contextmenu:visible');

	                menuData.manager.operations.activated(e, menuData);
	                menuData.events.activated($trigger, e, menuData);
	            });

	            $trigger.data('contextMenu', menuData).addClass('context-menu-active');

	            $(document).off('keydown.contextMenu').on('keydown.contextMenu', menuData, menuData.manager.handler.key);

	            if (menuData.autoHide) {
	                $(document).on('mousemove.contextMenuAutoHide', function (e) {
	                    var pos = $trigger.offset();
	                    pos.right = pos.left + $trigger.outerWidth();
	                    pos.bottom = pos.top + $trigger.outerHeight();

	                    if (menuData.$layer && !menuData.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom))) {
	                        setTimeout(function () {
	                            if (!menuData.hovering && menuData.$menu !== null && typeof menuData.$menu !== 'undefined') {
	                                menuData.$menu.trigger('contextmenu:hide');
	                            }
	                        }, 50);
	                    }
	                });
	            }
	        }
	    }, {
	        key: 'hide',
	        value: function hide(e, menuData, force) {
	            var $trigger = $(this);
	            if ((typeof menuData === 'undefined' ? 'undefined' : _typeof(menuData)) !== 'object' && $trigger.data('contextMenu')) {
	                menuData = $trigger.data('contextMenu');
	            } else if ((typeof menuData === 'undefined' ? 'undefined' : _typeof(menuData)) !== 'object') {
	                return;
	            }

	            if (!force && menuData.events && menuData.events.hide.call($trigger, e, menuData) === false) {
	                return;
	            }

	            $trigger.removeData('contextMenu').removeClass('context-menu-active');

	            if (menuData.$layer) {
	                setTimeout(function ($layer) {
	                    return function () {
	                        $layer.remove();
	                    };
	                }(menuData.$layer), 10);

	                try {
	                    delete menuData.$layer;
	                } catch (e) {
	                    menuData.$layer = null;
	                }
	            }

	            menuData.manager.handler.$currentTrigger = null;

	            menuData.$menu.find('.' + menuData.classNames.hover).trigger('contextmenu:blur');
	            menuData.$selected = null;

	            menuData.$menu.find('.' + menuData.classNames.visible).removeClass(menuData.classNames.visible);

	            $(document).off('.contextMenuAutoHide').off('keydown.contextMenu');

	            if (menuData.$menu) {
	                menuData.$menu[menuData.animation.hide](menuData.animation.duration, function () {
	                    if (menuData.build) {
	                        menuData.$menu.remove();
	                        Object.keys(menuData).forEach(function (key) {
	                            switch (key) {
	                                case 'ns':
	                                case 'selector':
	                                case 'build':
	                                case 'trigger':
	                                    return true;

	                                default:
	                                    menuData[key] = undefined;
	                                    try {
	                                        delete menuData[key];
	                                    } catch (e) {}
	                                    return true;
	                            }
	                        });
	                    }

	                    setTimeout(function () {
	                        $trigger.trigger('contextmenu:hidden');
	                    }, 10);
	                });
	            }
	        }
	    }, {
	        key: 'create',
	        value: function create(e, currentMenuData, rootMenuData) {
	            var _this = this;

	            if (typeof rootMenuData === 'undefined') {
	                rootMenuData = currentMenuData;
	            }

	            currentMenuData.$menu = $('<ul class="context-menu-list"></ul>').addClass(currentMenuData.className || '').data({
	                'contextMenu': currentMenuData,
	                'contextMenuRoot': rootMenuData
	            });

	            ['callbacks', 'commands', 'inputs'].forEach(function (k) {
	                currentMenuData[k] = {};
	                if (!rootMenuData[k]) {
	                    rootMenuData[k] = {};
	                }
	            });

	            if (!rootMenuData.accesskeys) {
	                rootMenuData.accesskeys = {};
	            }

	            function createNameNode(item) {
	                var $name = $('<span></span>');
	                if (item._accesskey) {
	                    if (item._beforeAccesskey) {
	                        $name.append(document.createTextNode(item._beforeAccesskey));
	                    }
	                    $('<span></span>').addClass('context-menu-accesskey').text(item._accesskey).appendTo($name);
	                    if (item._afterAccesskey) {
	                        $name.append(document.createTextNode(item._afterAccesskey));
	                    }
	                } else {
	                    if (item.isHtmlName) {
	                        if (typeof item.accesskey !== 'undefined') {
	                            throw new Error('accesskeys are not compatible with HTML names and cannot be used together in the same item');
	                        }
	                        $name.html(item.name);
	                    } else {
	                        $name.text(item.name);
	                    }
	                }
	                return $name;
	            }

	            Object.keys(currentMenuData.items).forEach(function (key) {
	                var item = currentMenuData.items[key];
	                var $t = $('<li class="context-menu-item"></li>').addClass(item.className || '');
	                var $label = null;
	                var $input = null;

	                $t.on('click', $.noop);

	                if (typeof item === 'string' || item.type === 'cm_seperator') {
	                    item = { type: _ContextMenuItemTypes2.default.separator };
	                }

	                item.$node = $t.data({
	                    'contextMenu': currentMenuData,
	                    'contextMenuRoot': rootMenuData,
	                    'contextMenuKey': key
	                });

	                if (typeof item.accesskey !== 'undefined') {
	                    var aks = _ContextMenuHelper2.default.splitAccesskey(item.accesskey);
	                    for (var i = 0, ak; ak = aks[i]; i++) {
	                        if (!rootMenuData.accesskeys[ak]) {
	                            rootMenuData.accesskeys[ak] = item;
	                            var matched = item.name.match(new RegExp('^(.*?)(' + ak + ')(.*)$', 'i'));
	                            if (matched) {
	                                item._beforeAccesskey = matched[1];
	                                item._accesskey = matched[2];
	                                item._afterAccesskey = matched[3];
	                            }
	                            break;
	                        }
	                    }
	                }

	                if (item.type && rootMenuData.types[item.type]) {
	                    rootMenuData.types[item.type].call($t, e, item, currentMenuData, rootMenuData);

	                    [currentMenuData, rootMenuData].forEach(function (k) {
	                        k.commands[key] = item;

	                        if (typeof item.callback === 'function' && (typeof k.callbacks[key] === 'undefined' || typeof currentMenuData.type === 'undefined')) {
	                            k.callbacks[key] = item.callback;
	                        }
	                    });
	                } else {
	                    if (item.type === _ContextMenuItemTypes2.default.separator) {
	                        $t.addClass('context-menu-separator ' + rootMenuData.classNames.notSelectable);
	                    } else if (item.type === _ContextMenuItemTypes2.default.html) {
	                        $t.addClass('context-menu-html ' + rootMenuData.classNames.notSelectable);
	                    } else if (item.type && item.type !== _ContextMenuItemTypes2.default.submenu) {
	                        $label = $('<label></label>').appendTo($t);
	                        createNameNode(item).appendTo($label);

	                        $t.addClass('context-menu-input');
	                        currentMenuData.hasTypes = true;
	                        [currentMenuData, rootMenuData].forEach(function (k) {
	                            k.commands[key] = item;
	                            k.inputs[key] = item;
	                        });
	                    } else if (item.items) {
	                        item.type = _ContextMenuItemTypes2.default.submenu;
	                    }

	                    switch (item.type) {
	                        case _ContextMenuItemTypes2.default.separator:
	                            break;

	                        case _ContextMenuItemTypes2.default.text:
	                            $input = $('<input type="text" value="1" name="" />').attr('name', 'context-menu-input-' + key).val(item.value || '').appendTo($label);
	                            break;

	                        case _ContextMenuItemTypes2.default.textarea:
	                            $input = $('<textarea name=""></textarea>').attr('name', 'context-menu-input-' + key).val(item.value || '').appendTo($label);

	                            if (item.height) {
	                                $input.height(item.height);
	                            }
	                            break;

	                        case _ContextMenuItemTypes2.default.checkbox:
	                            $input = $('<input type="checkbox" value="1" name="" />').attr('name', 'context-menu-input-' + key).val(item.value || '').prop('checked', !!item.selected).prependTo($label);
	                            break;

	                        case _ContextMenuItemTypes2.default.radio:
	                            $input = $('<input type="radio" value="1" name="" />').attr('name', 'context-menu-input-' + item.radio).val(item.value || '').prop('checked', !!item.selected).prependTo($label);
	                            break;

	                        case _ContextMenuItemTypes2.default.select:
	                            $input = $('<select name=""></select>').attr('name', 'context-menu-input-' + key).appendTo($label);
	                            if (item.options) {
	                                Object.keys(item.options).forEach(function (value) {
	                                    $('<option></option>').val(value).text(item.options[value]).appendTo($input);
	                                });
	                                $input.val(item.selected);
	                            }
	                            break;

	                        case _ContextMenuItemTypes2.default.submenu:
	                            createNameNode(item).appendTo($t);
	                            item.appendTo = item.$node;
	                            $t.data('contextMenu', item).addClass('context-menu-submenu');
	                            item.callback = null;

	                            if (typeof item.items.then === 'function') {
	                                rootMenuData.manager.operations.processPromises(e, item, rootMenuData, item.items);
	                            } else {
	                                rootMenuData.manager.operations.create(e, item, rootMenuData);
	                            }
	                            break;

	                        case _ContextMenuItemTypes2.default.html:
	                            $(item.html).appendTo($t);
	                            break;

	                        default:
	                            [currentMenuData, rootMenuData].forEach(function (k) {
	                                k.commands[key] = item;

	                                if (typeof item.callback === 'function' && (typeof k.callbacks[key] === 'undefined' || typeof currentMenuData.type === 'undefined')) {
	                                    k.callbacks[key] = item.callback;
	                                }
	                            });
	                            createNameNode(item).appendTo($t);
	                            break;
	                    }

	                    if (item.type && item.type !== _ContextMenuItemTypes2.default.submenu && item.type !== _ContextMenuItemTypes2.default.html && item.type !== _ContextMenuItemTypes2.default.separator) {
	                        $input.on('focus', rootMenuData.manager.handler.focusInput).on('blur', rootMenuData.manager.handler.blurInput);

	                        if (item.events) {
	                            $input.on(item.events, currentMenuData);
	                        }
	                    }

	                    if (item.icon) {
	                        if (typeof item.icon === 'function') {
	                            item._icon = item.icon.call(_this, e, $t, key, item, currentMenuData, rootMenuData);
	                        } else {
	                            if (typeof item.icon === 'string' && item.icon.substring(0, 3) === 'fa-') {
	                                item._icon = rootMenuData.classNames.icon + ' ' + rootMenuData.classNames.icon + '--fa fa ' + item.icon;
	                            } else {
	                                item._icon = rootMenuData.classNames.icon + ' ' + rootMenuData.classNames.icon + '-' + item.icon;
	                            }
	                        }
	                        $t.addClass(item._icon);
	                    }
	                }

	                item.$input = $input;
	                item.$label = $label;

	                $t.appendTo(currentMenuData.$menu);

	                if (!currentMenuData.hasTypes && $.support.eventSelectstart) {
	                    $t.on('selectstart.disableTextSelect', currentMenuData.manager.handler.abortevent);
	                }
	            });

	            if (!currentMenuData.$node) {
	                currentMenuData.$menu.css('display', 'none').addClass('context-menu-rootMenuData');
	            }
	            currentMenuData.$menu.appendTo(currentMenuData.appendTo || document.body);
	        }
	    }, {
	        key: 'resize',
	        value: function resize(e, $menu, nested) {
	            var domMenu = void 0;

	            $menu.css({ position: 'absolute', display: 'block' });

	            $menu.data('width', (domMenu = $menu.get(0)).getBoundingClientRect ? Math.ceil(domMenu.getBoundingClientRect().width) : $menu.outerWidth() + 1);
	            $menu.css({
	                position: 'static',
	                minWidth: '0px',
	                maxWidth: '100000px'
	            });

	            $menu.find('> li > ul').each(function (index, element) {
	                e.data.manager.operations.resize(e, $(element), true);
	            });

	            if (!nested) {
	                $menu.find('ul').addBack().css({
	                    position: '',
	                    display: '',
	                    minWidth: '',
	                    maxWidth: ''
	                }).outerWidth(function () {
	                    return $(this).data('width');
	                });
	            }
	        }
	    }, {
	        key: 'update',
	        value: function update(e, currentMenuData, rootMenuData) {
	            var $trigger = this;
	            if (typeof rootMenuData === 'undefined') {
	                rootMenuData = currentMenuData;
	                rootMenuData.manager.operations.resize(e, currentMenuData.$menu);
	            }

	            var hasVisibleItems = false;

	            currentMenuData.$menu.children().each(function (index, element) {
	                var $item = $(element);
	                var key = $item.data('contextMenuKey');
	                var item = currentMenuData.items[key];

	                var disabled = typeof item.disabled === 'function' && item.disabled.call($trigger, e, key, currentMenuData, rootMenuData) || item.disabled === true;
	                var visible = void 0;

	                if (typeof item.visible === 'function') {
	                    visible = item.visible.call($trigger, e, key, currentMenuData, rootMenuData);
	                } else if (typeof item.visible !== 'undefined') {
	                    visible = item.visible === true;
	                } else {
	                    visible = true;
	                }

	                if (visible) {
	                    hasVisibleItems = true;
	                }

	                $item[visible ? 'show' : 'hide']();

	                $item[disabled ? 'addClass' : 'removeClass'](rootMenuData.classNames.disabled);

	                if (typeof item.icon === 'function') {
	                    $item.removeClass(item._icon);
	                    item._icon = item.icon.call($trigger, e, $item, key, item, currentMenuData, rootMenuData);
	                    $item.addClass(item._icon);
	                }

	                if (item.type) {
	                    $item.find('input, select, textarea').prop('disabled', disabled);

	                    switch (item.type) {
	                        case _ContextMenuItemTypes2.default.text:
	                        case _ContextMenuItemTypes2.default.textarea:
	                            item.$input.val(item.value || '');
	                            break;

	                        case _ContextMenuItemTypes2.default.checkbox:
	                        case _ContextMenuItemTypes2.default.radio:
	                            item.$input.val(item.value || '').prop('checked', !!item.selected);
	                            break;

	                        case _ContextMenuItemTypes2.default.select:
	                            item.$input.val((item.selected === 0 ? '0' : item.selected) || '');
	                            break;
	                    }
	                }

	                if (item.$menu) {
	                    var subMenuHasVisibleItems = rootMenuData.manager.operations.update.call($trigger, e, item, rootMenuData);
	                    if (subMenuHasVisibleItems) {
	                        hasVisibleItems = true;
	                    }
	                }
	            });

	            return hasVisibleItems;
	        }
	    }, {
	        key: 'layer',
	        value: function layer(e, menuData, zIndex) {
	            var $window = $(window);

	            var $layer = menuData.$layer = $('<div id="context-menu-layer"></div>').css({
	                height: $window.height(),
	                width: $window.width(),
	                display: 'block',
	                position: 'fixed',
	                'z-index': zIndex,
	                top: 0,
	                left: 0,
	                opacity: 0,
	                filter: 'alpha(opacity=0)',
	                'background-color': '#000'
	            }).data('contextMenuRoot', menuData).insertBefore(this).on('contextmenu', menuData.manager.handler.abortevent).on('mousedown', menuData.manager.handler.layerClick);

	            if (typeof document.body.style.maxWidth === 'undefined') {
	                $layer.css({
	                    'position': 'absolute',
	                    'height': $(document).height()
	                });
	            }

	            return $layer;
	        }
	    }, {
	        key: 'processPromises',
	        value: function processPromises(e, currentMenuData, rootMenuData, promise) {
	            currentMenuData.$node.addClass(rootMenuData.classNames.iconLoadingClass);

	            function finishPromiseProcess(currentMenuData, rootMenuData, items) {
	                if (typeof rootMenuData.$menu === 'undefined' || !rootMenuData.$menu.is(':visible')) {
	                    return;
	                }
	                currentMenuData.$node.removeClass(rootMenuData.classNames.iconLoadingClass);
	                currentMenuData.items = items;
	                rootMenuData.manager.operations.create(e, currentMenuData, rootMenuData);
	                rootMenuData.manager.operations.update(e, currentMenuData, rootMenuData);
	                rootMenuData.positionSubmenu.call(currentMenuData.$node, e, currentMenuData.$menu);
	            }

	            function errorPromise(currentMenuData, rootMenuData, errorItem) {
	                if (typeof errorItem === 'undefined') {
	                    errorItem = {
	                        'error': {
	                            name: 'No items and no error item',
	                            icon: 'context-menu-icon context-menu-icon-quit'
	                        }
	                    };
	                    if (window.console) {
	                        (console.error || console.log).call(console, 'When you reject a promise, provide an "items" object, equal to normal sub-menu items');
	                    }
	                } else if (typeof errorItem === 'string') {
	                    errorItem = { 'error': { name: errorItem } };
	                }
	                finishPromiseProcess(currentMenuData, rootMenuData, errorItem);
	            }

	            function completedPromise(currentMenuData, rootMenuData, items) {
	                if (typeof items === 'undefined') {
	                    errorPromise(undefined);
	                }
	                finishPromiseProcess(currentMenuData, rootMenuData, items);
	            }

	            promise.then(completedPromise.bind(this, currentMenuData, rootMenuData), errorPromise.bind(this, currentMenuData, rootMenuData));
	        }
	    }, {
	        key: 'activated',
	        value: function activated(e, menuData) {
	            var $menu = menuData.$menu;
	            var $menuOffset = $menu.offset();
	            var winHeight = $(window).height();
	            var winScrollTop = $(window).scrollTop();
	            var menuHeight = $menu.height();
	            if (menuHeight > winHeight) {
	                $menu.css({
	                    'height': winHeight + 'px',
	                    'overflow-x': 'hidden',
	                    'overflow-y': 'auto',
	                    'top': winScrollTop + 'px'
	                });
	            } else if ($menuOffset.top < winScrollTop || $menuOffset.top + menuHeight > winScrollTop + winHeight) {
	                $menu.css({
	                    'top': '0px'
	                });
	            }
	        }
	    }]);

	    return ContextMenuOperations;
	}();

	exports.default = ContextMenuOperations;

	/***/ }),
	/* 6 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextMenuHelper = function () {
	    function ContextMenuHelper() {
	        _classCallCheck(this, ContextMenuHelper);
	    }

	    _createClass(ContextMenuHelper, null, [{
	        key: 'zindex',
	        value: function zindex($t) {
	            var zin = 0;
	            var $tt = $t;

	            while (true) {
	                zin = Math.max(zin, parseInt($tt.css('z-index'), 10) || 0);
	                $tt = $tt.parent();
	                if (!$tt || !$tt.length || 'html body'.indexOf($tt.prop('nodeName').toLowerCase()) > -1) {
	                    break;
	                }
	            }
	            return zin;
	        }
	    }, {
	        key: 'splitAccesskey',
	        value: function splitAccesskey(val) {
	            var t = val.split(/\s+/);
	            var keys = [];

	            for (var i = 0, k; k = t[i]; i++) {
	                k = k.charAt(0).toUpperCase();
	                keys.push(k);
	            }

	            return keys;
	        }
	    }]);

	    return ContextMenuHelper;
	}();

	exports.default = ContextMenuHelper;

	/***/ }),
	/* 7 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.determinePosition = determinePosition;
	exports.position = position;
	exports.positionSubmenu = positionSubmenu;
	function determinePosition($menu) {
	    if ($.ui && $.ui.position) {
	        $menu.css('display', 'block').position({
	            my: 'center top',
	            at: 'center bottom',
	            of: this,
	            offset: '0 5',
	            collision: 'fit'
	        }).css('display', 'none');
	    } else {
	        var offset = this.offset();
	        offset.top += this.outerHeight();
	        offset.left += this.outerWidth() / 2 - $menu.outerWidth() / 2;
	        $menu.css(offset);
	    }
	}

	function position(e, currentMenuData, x, y) {
	    var $window = $(window);
	    var offset = void 0;

	    if (!x && !y) {
	        currentMenuData.determinePosition.call(this, currentMenuData.$menu);
	        return;
	    } else if (x === 'maintain' && y === 'maintain') {
	        offset = currentMenuData.$menu.position();
	    } else {
	        var offsetParentOffset = currentMenuData.$menu.offsetParent().offset();
	        offset = { top: y - offsetParentOffset.top, left: x - offsetParentOffset.left };
	    }

	    var bottom = $window.scrollTop() + $window.height();
	    var right = $window.scrollLeft() + $window.width();
	    var height = currentMenuData.$menu.outerHeight();
	    var width = currentMenuData.$menu.outerWidth();

	    if (offset.top + height > bottom) {
	        offset.top -= height;
	    }

	    if (offset.top < 0) {
	        offset.top = 0;
	    }

	    if (offset.left + width > right) {
	        offset.left -= width;
	    }

	    if (offset.left < 0) {
	        offset.left = 0;
	    }

	    currentMenuData.$menu.css(offset);
	}

	function positionSubmenu(e, $menu) {
	    if (typeof $menu === 'undefined') {
	        return;
	    }
	    if ($.ui && $.ui.position) {
	        $menu.css('display', 'block').position({
	            my: 'left top-5',
	            at: 'right top',
	            of: this,
	            collision: 'flipfit fit'
	        }).css('display', '');
	    } else {
	        var offset = {
	            top: -9,
	            left: this.outerWidth() - 5
	        };
	        $menu.css(offset);
	    }
	}

	/***/ }),
	/* 8 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextMenuHtml5Builder = function () {
	    function ContextMenuHtml5Builder() {
	        _classCallCheck(this, ContextMenuHtml5Builder);
	    }

	    _createClass(ContextMenuHtml5Builder, [{
	        key: 'inputLabel',
	        value: function inputLabel(node) {
	            return node.id && $('label[for="' + node.id + '"]').val() || node.name;
	        }
	    }, {
	        key: 'fromMenu',
	        value: function fromMenu(element) {
	            var $this = $(element);
	            var items = {};

	            this.build(items, $this.children());

	            return items;
	        }
	    }, {
	        key: 'build',
	        value: function build(items, $children, counter) {
	            if (!counter) {
	                counter = 0;
	            }

	            var builder = this;

	            $children.each(function () {
	                var $node = $(this);
	                var node = this;
	                var nodeName = this.nodeName.toLowerCase();
	                var label = void 0;
	                var item = void 0;

	                if (nodeName === 'label' && $node.find('input, textarea, select').length) {
	                    label = $node.text();
	                    $node = $node.children().first();
	                    node = $node.get(0);
	                    nodeName = node.nodeName.toLowerCase();
	                }

	                switch (nodeName) {
	                    case 'menu':
	                        item = { name: $node.attr('label'), items: {} };
	                        counter = builder.build(item.items, $node.children(), counter);
	                        break;

	                    case 'a':
	                    case 'button':
	                        item = {
	                            name: $node.text(),
	                            disabled: !!$node.attr('disabled'),
	                            callback: function () {
	                                return function () {
	                                    $node.get(0).click();
	                                };
	                            }()
	                        };
	                        break;

	                    case 'menuitem':
	                    case 'command':
	                        switch ($node.attr('type')) {
	                            case undefined:
	                            case 'command':
	                            case 'menuitem':
	                                item = {
	                                    name: $node.attr('label'),
	                                    disabled: !!$node.attr('disabled'),
	                                    icon: $node.attr('icon'),
	                                    callback: function () {
	                                        return function () {
	                                            $node.get(0).click();
	                                        };
	                                    }()
	                                };
	                                break;

	                            case 'checkbox':
	                                item = {
	                                    type: 'checkbox',
	                                    disabled: !!$node.attr('disabled'),
	                                    name: $node.attr('label'),
	                                    selected: !!$node.attr('checked')
	                                };
	                                break;
	                            case 'radio':
	                                item = {
	                                    type: 'radio',
	                                    disabled: !!$node.attr('disabled'),
	                                    name: $node.attr('label'),
	                                    radio: $node.attr('radiogroup'),
	                                    value: $node.attr('id'),
	                                    selected: !!$node.attr('checked')
	                                };
	                                break;

	                            default:
	                                item = undefined;
	                        }
	                        break;

	                    case 'hr':
	                        item = '-------';
	                        break;

	                    case 'input':
	                        switch ($node.attr('type')) {
	                            case 'text':
	                                item = {
	                                    type: 'text',
	                                    name: label || builder.inputLabel(node),
	                                    disabled: !!$node.attr('disabled'),
	                                    value: $node.val()
	                                };
	                                break;

	                            case 'checkbox':
	                                item = {
	                                    type: 'checkbox',
	                                    name: label || builder.inputLabel(node),
	                                    disabled: !!$node.attr('disabled'),
	                                    selected: !!$node.attr('checked')
	                                };
	                                break;

	                            case 'radio':
	                                item = {
	                                    type: 'radio',
	                                    name: label || builder.inputLabel(node),
	                                    disabled: !!$node.attr('disabled'),
	                                    radio: !!$node.attr('name'),
	                                    value: $node.val(),
	                                    selected: !!$node.attr('checked')
	                                };
	                                break;

	                            default:
	                                item = undefined;
	                                break;
	                        }
	                        break;

	                    case 'select':
	                        item = {
	                            type: 'select',
	                            name: label || builder.inputLabel(node),
	                            disabled: !!$node.attr('disabled'),
	                            selected: $node.val(),
	                            options: {}
	                        };
	                        $node.children().each(function () {
	                            item.options[this.value] = $(this).text();
	                        });
	                        break;

	                    case 'textarea':
	                        item = {
	                            type: 'textarea',
	                            name: label || builder.inputLabel(node),
	                            disabled: !!$node.attr('disabled'),
	                            value: $node.val()
	                        };
	                        break;

	                    case 'label':
	                        break;

	                    default:
	                        item = { type: 'html', html: $node.clone(true) };
	                        break;
	                }

	                if (item) {
	                    counter++;
	                    items['key' + counter] = item;
	                }
	            });

	            return counter;
	        }
	    }]);

	    return ContextMenuHtml5Builder;
	}();

	exports.default = ContextMenuHtml5Builder;

	/***/ }),
	/* 9 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _defaults = __webpack_require__(1);

	var _defaults2 = _interopRequireDefault(_defaults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextMenuEventHandler = function () {
	    function ContextMenuEventHandler() {
	        _classCallCheck(this, ContextMenuEventHandler);

	        this.$currentTrigger = null;
	        this.hoveract = {};
	    }

	    _createClass(ContextMenuEventHandler, [{
	        key: 'abortevent',
	        value: function abortevent(e) {
	            e.preventDefault();
	            e.stopImmediatePropagation();
	        }
	    }, {
	        key: 'contextmenu',
	        value: function contextmenu(e) {
	            var $this = $(e.currentTarget);

	            if (!e.data) {
	                throw new Error('No data attached');
	            }

	            if (e.data.trigger === 'right') {
	                e.preventDefault();
	                e.stopImmediatePropagation();
	            }

	            if (e.data.trigger !== 'right' && e.data.trigger !== 'demand' && e.originalEvent) {
	                return;
	            }

	            if (typeof e.mouseButton !== 'undefined') {
	                if (!(e.data.trigger === 'left' && e.mouseButton === 0) && !(e.data.trigger === 'right' && e.mouseButton === 2)) {
	                    return;
	                }
	            }

	            if ($this.hasClass('context-menu-active')) {
	                return;
	            }

	            if (!$this.hasClass('context-menu-disabled')) {

	                e.data.manager.handler.$currentTrigger = $this;
	                if (e.data.build) {
	                    var built = e.data.build(e, $this);

	                    if (built === false) {
	                        return;
	                    }

	                    e.data = $.extend(true, {}, _defaults2.default, e.data, built || {});

	                    if (!e.data.items || $.isEmptyObject(e.data.items)) {
	                        if (window.console) {
	                            (console.error || console.log).call(console, 'No items specified to show in contextMenu');
	                        }

	                        throw new Error('No Items specified');
	                    }

	                    e.data.$trigger = e.data.manager.handler.$currentTrigger;

	                    e.data.manager.operations.create(e, e.data);
	                }

	                e.data.manager.operations.show.call($this, e, e.data, e.pageX, e.pageY);
	            }
	        }
	    }, {
	        key: 'click',
	        value: function click(e) {
	            e.preventDefault();
	            e.stopImmediatePropagation();
	            $(this).trigger($.Event('contextmenu', { data: e.data, pageX: e.pageX, pageY: e.pageY, originalEvent: e }));
	        }
	    }, {
	        key: 'mousedown',
	        value: function mousedown(e) {
	            var $this = $(this);

	            if (e.data.manager.handler.$currentTrigger && e.data.manager.handler.$currentTrigger.length && !e.data.manager.handler.$currentTrigger.is($this)) {
	                e.data.manager.handler.$currentTrigger.data('contextMenu').$menu.trigger($.Event('contextmenu', {
	                    data: e.data,
	                    originalEvent: e
	                }));
	            }

	            if (e.button === 2) {
	                e.data.manager.handler.$currentTrigger = $this.data('contextMenuActive', true);
	            }
	        }
	    }, {
	        key: 'mouseup',
	        value: function mouseup(e) {
	            var $this = $(this);
	            if ($this.data('contextMenuActive') && e.data.manager.handler.$currentTrigger && e.data.manager.handler.$currentTrigger.length && e.data.manager.handler.$currentTrigger.is($this) && !$this.hasClass('context-menu-disabled')) {
	                e.preventDefault();
	                e.stopImmediatePropagation();
	                e.data.manager.handler.$currentTrigger = $this;
	                $this.trigger($.Event('contextmenu', { data: e.data, pageX: e.pageX, pageY: e.pageY, originalEvent: e }));
	            }

	            $this.removeData('contextMenuActive');
	        }
	    }, {
	        key: 'mouseenter',
	        value: function mouseenter(e) {
	            var $this = $(this);
	            var $related = $(e.relatedTarget);
	            var $document = $(document);

	            if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
	                return;
	            }

	            if (e.data.manager.handler.$currentTrigger && e.data.manager.handler.$currentTrigger.length) {
	                return;
	            }

	            e.data.manager.handler.hoveract.pageX = e.pageX;
	            e.data.manager.handler.hoveract.pageY = e.pageY;
	            e.data.manager.handler.hoveract.data = e.data;
	            $document.on('mousemove.contextMenuShow', e.data.manager.handler.mousemove);
	            e.data.manager.handler.hoveract.timer = setTimeout(function () {
	                e.data.manager.handler.hoveract.timer = null;
	                $document.off('mousemove.contextMenuShow');
	                e.data.manager.handler.$currentTrigger = $this;
	                $this.trigger($.Event('contextmenu', {
	                    data: e.data.manager.handler.hoveract.data,
	                    pageX: e.data.manager.handler.hoveract.pageX,
	                    pageY: e.data.manager.handler.hoveract.pageY
	                }));
	            }, e.data.delay);
	        }
	    }, {
	        key: 'mousemove',
	        value: function mousemove(e) {
	            e.data.manager.handler.hoveract.pageX = e.pageX;
	            e.data.manager.handler.hoveract.pageY = e.pageY;
	        }
	    }, {
	        key: 'mouseleave',
	        value: function mouseleave(e) {
	            var $related = $(e.relatedTarget);
	            if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
	                return;
	            }

	            try {
	                clearTimeout(e.data.manager.handler.hoveract.timer);
	            } catch (e) {}

	            e.data.manager.handler.hoveract.timer = null;
	        }
	    }, {
	        key: 'layerClick',
	        value: function layerClick(e) {
	            var $this = $(this);

	            var root = $this.data('contextMenuRoot');

	            if (root === null || typeof root === 'undefined') {
	                throw new Error('No ContextMenuData found');
	            }

	            var button = e.button;
	            var x = e.pageX;
	            var y = e.pageY;
	            var fakeClick = x === undefined;
	            var target = void 0;
	            var offset = void 0;

	            e.preventDefault();

	            setTimeout(function () {
	                if (fakeClick) {
	                    if (root.$menu !== null && typeof root.$menu !== 'undefined') {
	                        root.$menu.trigger('contextmenu:hide', { data: root, originalEvent: e });
	                    }
	                    return;
	                }

	                var $window = $(window);
	                var triggerAction = root.trigger === 'left' && button === 0 || root.trigger === 'right' && button === 2;

	                if (document.elementFromPoint && root.$layer) {
	                    root.$layer.hide();
	                    target = document.elementFromPoint(x - $window.scrollLeft(), y - $window.scrollTop());

	                    if (target.isContentEditable) {
	                        var range = document.createRange();
	                        var sel = window.getSelection();
	                        range.selectNode(target);
	                        range.collapse(true);
	                        sel.removeAllRanges();
	                        sel.addRange(range);
	                    }
	                    $(target).trigger(e);
	                    root.$layer.show();
	                }

	                if (root.hideOnSecondTrigger && triggerAction && root.$menu !== null && typeof root.$menu !== 'undefined') {
	                    root.$menu.trigger('contextmenu:hide', { data: root, originalEvent: e });
	                    return;
	                }

	                if (root.reposition && triggerAction) {
	                    if (document.elementFromPoint) {
	                        if (root.$trigger.is(target)) {
	                            root.position.call(root.$trigger, e, root, x, y);
	                            return;
	                        }
	                    } else {
	                        offset = root.$trigger.offset();
	                        var _$window = $(window);

	                        offset.top += _$window.scrollTop();
	                        if (offset.top <= e.pageY) {
	                            offset.left += _$window.scrollLeft();
	                            if (offset.left <= e.pageX) {
	                                offset.bottom = offset.top + root.$trigger.outerHeight();
	                                if (offset.bottom >= e.pageY) {
	                                    offset.right = offset.left + root.$trigger.outerWidth();
	                                    if (offset.right >= e.pageX) {
	                                        root.position.call(root.$trigger, e, root, x, y);
	                                        return;
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }

	                if (target && triggerAction) {
	                    root.$trigger.one('contextmenu:hidden', function () {
	                        $(target).contextMenu({ x: x, y: y, button: button, originalEvent: e });
	                    });
	                }

	                if (root.$menu !== null && typeof root.$menu !== 'undefined') {
	                    root.$menu.trigger('contextmenu:hide', { data: root, originalEvent: e });
	                }
	            }, 50);
	        }
	    }, {
	        key: 'keyStop',
	        value: function keyStop(e, currentMenuData) {
	            if (!currentMenuData.isInput) {
	                e.preventDefault();
	            }

	            e.stopPropagation();
	        }
	    }, {
	        key: 'key',
	        value: function key(e) {
	            var rootMenuData = {};

	            if (e.data.manager.handler.$currentTrigger) {
	                rootMenuData = e.data.manager.handler.$currentTrigger.data('contextMenu') || {};
	            }

	            if (typeof rootMenuData.zIndex === 'undefined') {
	                rootMenuData.zIndex = 0;
	            }
	            var getZIndexOfTriggerTarget = function getZIndexOfTriggerTarget(target) {
	                if (target.style.zIndex !== '') {
	                    return target.style.zIndex;
	                } else {
	                    if (target.offsetParent !== null && typeof target.offsetParent !== 'undefined') {
	                        return getZIndexOfTriggerTarget(target.offsetParent);
	                    } else if (target.parentElement !== null && typeof target.parentElement !== 'undefined') {
	                        return getZIndexOfTriggerTarget(target.parentElement);
	                    }
	                }
	            };
	            var targetZIndex = getZIndexOfTriggerTarget(e.target);

	            if (rootMenuData.$menu && parseInt(targetZIndex, 10) > parseInt(rootMenuData.$menu.css('zIndex'), 10)) {
	                return;
	            }
	            switch (e.keyCode) {
	                case 9:
	                case 38:
	                    e.data.manager.handler.keyStop(e, rootMenuData);

	                    if (rootMenuData.isInput) {
	                        if (e.keyCode === 9 && e.shiftKey) {
	                            e.preventDefault();
	                            if (rootMenuData.$selected) {
	                                rootMenuData.$selected.find('input, textarea, select').blur();
	                            }
	                            if (rootMenuData.$menu !== null && typeof rootMenuData.$menu !== 'undefined') {
	                                rootMenuData.$menu.trigger('prevcommand', { data: rootMenuData, originalEvent: e });
	                            }
	                            return;
	                        } else if (e.keyCode === 38 && rootMenuData.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
	                            e.preventDefault();
	                            return;
	                        }
	                    } else if (e.keyCode !== 9 || e.shiftKey) {
	                        if (rootMenuData.$menu !== null && typeof rootMenuData.$menu !== 'undefined') {
	                            rootMenuData.$menu.trigger('prevcommand', { data: rootMenuData, originalEvent: e });
	                        }
	                        return;
	                    }
	                    break;

	                case 40:
	                    e.data.manager.handler.keyStop(e, rootMenuData);
	                    if (rootMenuData.isInput) {
	                        if (e.keyCode === 9) {
	                            e.preventDefault();
	                            if (rootMenuData.$selected) {
	                                rootMenuData.$selected.find('input, textarea, select').blur();
	                            }
	                            if (rootMenuData.$menu !== null && typeof rootMenuData.$menu !== 'undefined') {
	                                rootMenuData.$menu.trigger('nextcommand', { data: rootMenuData, originalEvent: e });
	                            }
	                            return;
	                        } else if (e.keyCode === 40 && rootMenuData.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
	                            e.preventDefault();
	                            return;
	                        }
	                    } else {
	                        if (rootMenuData.$menu !== null && typeof rootMenuData.$menu !== 'undefined') {
	                            rootMenuData.$menu.trigger('nextcommand', { data: rootMenuData, originalEvent: e });
	                        }
	                        return;
	                    }
	                    break;

	                case 37:
	                    e.data.manager.handler.keyStop(e, rootMenuData);
	                    if (rootMenuData.isInput || !rootMenuData.$selected || !rootMenuData.$selected.length) {
	                        break;
	                    }

	                    if (!rootMenuData.$selected.parent().hasClass('context-menu-root')) {
	                        var $parent = rootMenuData.$selected.parent().parent();
	                        rootMenuData.$selected.trigger('contextmenu:blur', { data: rootMenuData, originalEvent: e });
	                        rootMenuData.$selected = $parent;
	                        return;
	                    }
	                    break;

	                case 39:
	                    e.data.manager.handler.keyStop(e, rootMenuData);
	                    if (rootMenuData.isInput || !rootMenuData.$selected || !rootMenuData.$selected.length) {
	                        break;
	                    }

	                    var itemdata = rootMenuData.$selected.data('contextMenu') || {};
	                    if (itemdata.$menu && rootMenuData.$selected.hasClass('context-menu-submenu')) {
	                        rootMenuData.$selected = null;
	                        itemdata.$selected = null;
	                        itemdata.$menu.trigger('nextcommand', { data: itemdata, originalEvent: e });
	                        return;
	                    }
	                    break;

	                case 35:
	                case 36:
	                    if (rootMenuData.$selected && rootMenuData.$selected.find('input, textarea, select').length) {
	                        break;
	                    } else {
	                        (rootMenuData.$selected && rootMenuData.$selected.parent() || rootMenuData.$menu).children(':not(.' + rootMenuData.classNames.disabled + ', .' + rootMenuData.classNames.notSelectable + ')')[e.keyCode === 36 ? 'first' : 'last']().trigger('contextmenu:focus', { data: rootMenuData, originalEvent: e });
	                        e.preventDefault();
	                        break;
	                    }
	                case 13:
	                    e.data.manager.handler.keyStop(e, rootMenuData);
	                    if (rootMenuData.isInput) {
	                        if (rootMenuData.$selected && !rootMenuData.$selected.is('textarea, select')) {
	                            e.preventDefault();
	                            return;
	                        }
	                        break;
	                    }
	                    if (typeof rootMenuData.$selected !== 'undefined' && rootMenuData.$selected !== null) {
	                        rootMenuData.$selected.trigger('mouseup', { data: rootMenuData, originalEvent: e });
	                    }
	                    return;
	                case 32:
	                case 33:
	                case 34:
	                    e.data.manager.handler.keyStop(e, rootMenuData);
	                    return;

	                case 27:
	                    e.data.manager.handler.keyStop(e, rootMenuData);
	                    if (rootMenuData.$menu !== null && typeof rootMenuData.$menu !== 'undefined') {
	                        rootMenuData.$menu.trigger('contextmenu:hide', { data: rootMenuData, originalEvent: e });
	                    }
	                    return;

	                default:
	                    var k = String.fromCharCode(e.keyCode).toUpperCase();
	                    if (rootMenuData.accesskeys && rootMenuData.accesskeys[k]) {
	                        rootMenuData.accesskeys[k].$node.trigger(rootMenuData.accesskeys[k].$menu ? 'contextmenu:focus' : 'mouseup', {
	                            data: rootMenuData,
	                            originalEvent: e
	                        });
	                        return;
	                    }
	                    break;
	            }

	            e.stopPropagation();
	            if (typeof rootMenuData.$selected !== 'undefined' && rootMenuData.$selected !== null) {
	                rootMenuData.$selected.trigger(e);
	            }
	        }
	    }, {
	        key: 'prevItem',
	        value: function prevItem(e) {
	            e.stopPropagation();
	            var currentMenuData = $(this).data('contextMenu') || {};
	            var rootMenuData = $(this).data('contextMenuRoot') || {};

	            if (currentMenuData.$selected) {
	                var $s = currentMenuData.$selected;
	                currentMenuData = currentMenuData.$selected.parent().data('contextMenu') || {};
	                currentMenuData.$selected = $s;
	            }

	            var $children = currentMenuData.$menu.children();
	            var $prev = !currentMenuData.$selected || !currentMenuData.$selected.prev().length ? $children.last() : currentMenuData.$selected.prev();
	            var $round = $prev;

	            while ($prev.hasClass(rootMenuData.classNames.disabled) || $prev.hasClass(rootMenuData.classNames.notSelectable) || $prev.is(':hidden')) {
	                if ($prev.prev().length) {
	                    $prev = $prev.prev();
	                } else {
	                    $prev = $children.last();
	                }

	                if ($prev.is($round)) {
	                    return;
	                }
	            }

	            if (currentMenuData.$selected) {
	                rootMenuData.manager.handler.itemMouseleave.call(currentMenuData.$selected.get(0), e);
	            }

	            rootMenuData.manager.handler.itemMouseenter.call($prev.get(0), e);

	            var $input = $prev.find('input, textarea, select');
	            if ($input.length) {
	                $input.focus();
	            }
	        }
	    }, {
	        key: 'nextItem',
	        value: function nextItem(e) {
	            e.stopPropagation();
	            var currentMenuData = $(this).data('contextMenu') || {};
	            var rootMenuData = $(this).data('contextMenuRoot') || {};

	            if (currentMenuData.$selected) {
	                var $s = currentMenuData.$selected;
	                currentMenuData = currentMenuData.$selected.parent().data('contextMenu') || {};
	                currentMenuData.$selected = $s;
	            }

	            var $children = currentMenuData.$menu.children();
	            var $next = !currentMenuData.$selected || !currentMenuData.$selected.next().length ? $children.first() : currentMenuData.$selected.next();
	            var $round = $next;

	            while ($next.hasClass(rootMenuData.classNames.disabled) || $next.hasClass(rootMenuData.classNames.notSelectable) || $next.is(':hidden')) {
	                if ($next.next().length) {
	                    $next = $next.next();
	                } else {
	                    $next = $children.first();
	                }
	                if ($next.is($round)) {
	                    return;
	                }
	            }

	            if (currentMenuData.$selected) {
	                rootMenuData.manager.handler.itemMouseleave.call(currentMenuData.$selected.get(0), e);
	            }

	            rootMenuData.manager.handler.itemMouseenter.call($next.get(0), e);

	            var $input = $next.find('input, textarea, select');
	            if ($input.length) {
	                $input.focus();
	            }
	        }
	    }, {
	        key: 'focusInput',
	        value: function focusInput(e) {
	            var $this = $(this).closest('.context-menu-item');
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;

	            rootMenuData.$selected = currentMenuData.$selected = $this;
	            rootMenuData.isInput = currentMenuData.isInput = true;
	        }
	    }, {
	        key: 'blurInput',
	        value: function blurInput(e) {
	            var $this = $(this).closest('.context-menu-item');
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;

	            rootMenuData.isInput = currentMenuData.isInput = false;
	        }
	    }, {
	        key: 'menuMouseenter',
	        value: function menuMouseenter(e) {
	            var root = $(this).data().contextMenuRoot;
	            root.hovering = true;
	        }
	    }, {
	        key: 'menuMouseleave',
	        value: function menuMouseleave(e) {
	            var root = $(this).data().contextMenuRoot;
	            if (root.$layer && root.$layer.is(e.relatedTarget)) {
	                root.hovering = false;
	            }
	        }
	    }, {
	        key: 'itemMouseenter',
	        value: function itemMouseenter(e) {
	            var $this = $(this);
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;

	            rootMenuData.hovering = true;

	            if (e && rootMenuData.$layer && rootMenuData.$layer.is(e.relatedTarget)) {
	                e.preventDefault();
	                e.stopImmediatePropagation();
	            }

	            var targetMenu = currentMenuData.$menu ? currentMenuData : rootMenuData;
	            targetMenu.$menu.children('.' + rootMenuData.classNames.hover).trigger('contextmenu:blur', {
	                data: targetMenu,
	                originalEvent: e
	            }).children('.hover').trigger('contextmenu:blur', { data: targetMenu, originalEvent: e });

	            if ($this.hasClass(rootMenuData.classNames.disabled) || $this.hasClass(rootMenuData.classNames.notSelectable)) {
	                currentMenuData.$selected = null;
	                return;
	            }

	            $this.trigger('contextmenu:focus', { data: currentMenuData, originalEvent: e });
	        }
	    }, {
	        key: 'itemMouseleave',
	        value: function itemMouseleave(e) {
	            var $this = $(this);
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;

	            if (rootMenuData !== currentMenuData && rootMenuData.$layer && rootMenuData.$layer.is(e.relatedTarget)) {
	                if (typeof rootMenuData.$selected !== 'undefined' && rootMenuData.$selected !== null) {
	                    rootMenuData.$selected.trigger('contextmenu:blur', { data: rootMenuData, originalEvent: e });
	                }
	                e.preventDefault();
	                e.stopImmediatePropagation();
	                rootMenuData.$selected = currentMenuData.$selected = currentMenuData.$node;
	                return;
	            }

	            if (currentMenuData && currentMenuData.$menu && currentMenuData.$menu.hasClass(rootMenuData.classNames.visible)) {
	                return;
	            }

	            $this.trigger('contextmenu:blur');
	        }
	    }, {
	        key: 'itemClick',
	        value: function itemClick(e) {
	            var $this = $(this);
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;
	            var key = data.contextMenuKey;
	            var callback = void 0;

	            if (!currentMenuData.items[key] || $this.is('.' + rootMenuData.classNames.disabled + ', .context-menu-separator, .' + rootMenuData.classNames.notSelectable) || $this.is('.context-menu-submenu') && rootMenuData.selectableSubMenu === false) {
	                return;
	            }

	            e.preventDefault();
	            e.stopImmediatePropagation();

	            if (typeof currentMenuData.callbacks[key] === 'function' && Object.prototype.hasOwnProperty.call(currentMenuData.callbacks, key)) {
	                callback = currentMenuData.callbacks[key];
	            } else if (typeof rootMenuData.callback === 'function') {
	                callback = rootMenuData.callback;
	            } else {
	                return;
	            }

	            if (callback.call(rootMenuData.$trigger, e, key, currentMenuData, rootMenuData) !== false) {
	                rootMenuData.$menu.trigger('contextmenu:hide');
	            } else if (rootMenuData.$menu.parent().length) {
	                rootMenuData.manager.operations.update.call(rootMenuData.$trigger, e, rootMenuData);
	            }
	        }
	    }, {
	        key: 'inputClick',
	        value: function inputClick(e) {
	            e.stopImmediatePropagation();
	        }
	    }, {
	        key: 'hideMenu',
	        value: function hideMenu(e, data) {
	            var root = $(this).data('contextMenuRoot');
	            root.manager.operations.hide.call(root.$trigger, e, root, data && data.force);
	        }
	    }, {
	        key: 'focusItem',
	        value: function focusItem(e) {
	            e.stopPropagation();
	            var $this = $(this);
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;

	            if ($this.hasClass(rootMenuData.classNames.disabled) || $this.hasClass(rootMenuData.classNames.notSelectable)) {
	                return;
	            }

	            $this.addClass([rootMenuData.classNames.hover, rootMenuData.classNames.visible].join(' ')).parent().find('.context-menu-item').not($this).removeClass(rootMenuData.classNames.visible).filter('.' + rootMenuData.classNames.hover).trigger('contextmenu:blur');

	            currentMenuData.$selected = rootMenuData.$selected = $this;

	            if (currentMenuData.$node && currentMenuData.$node.hasClass('context-menu-submenu')) {
	                currentMenuData.$node.addClass(rootMenuData.classNames.hover);
	            }

	            if (currentMenuData.$node) {
	                rootMenuData.positionSubmenu.call(currentMenuData.$node, e, currentMenuData.$menu);
	            }
	        }
	    }, {
	        key: 'blurItem',
	        value: function blurItem(e) {
	            e.stopPropagation();
	            var $this = $(this);
	            var data = $this.data();
	            var currentMenuData = data.contextMenu;
	            var rootMenuData = data.contextMenuRoot;

	            if (rootMenuData.autoHide) {
	                $this.removeClass(rootMenuData.classNames.visible);
	            }
	            $this.removeClass(rootMenuData.classNames.hover);
	            currentMenuData.$selected = null;
	        }
	    }]);

	    return ContextMenuEventHandler;
	}();

	exports.default = ContextMenuEventHandler;

	/***/ }),
	/* 10 */
	/***/ (function(module, exports, __webpack_require__) {


	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports.default = function (operation) {
	    var $t = this;
	    var $o = operation;
	    if ($t.length > 0) {
	        if (typeof operation === 'undefined') {
	            $t.first().trigger('contextmenu');
	        } else if (typeof operation.x !== 'undefined' && typeof operation.y !== 'undefined') {
	            $t.first().trigger($.Event('contextmenu', {
	                pageX: operation.x,
	                pageY: operation.y,
	                mouseButton: operation.button
	            }));
	        } else if (operation === 'hide') {
	            var $menu = this.first().data('contextMenu') ? this.first().data('contextMenu').$menu : null;
	            if ($menu) {
	                $menu.trigger('contextmenu:hide');
	            }
	        } else if (operation === 'destroy') {
	            $.contextMenu('destroy', { context: this });
	        } else if (operation === 'update') {
	            $.contextMenu('update', { context: this });
	        } else if ($.isPlainObject(operation)) {
	            operation.context = this;
	            $.contextMenu('create', operation);
	        } else if (operation === true) {
	            $t.removeClass('context-menu-disabled');
	        } else if (operation === false) {
	            $t.addClass('context-menu-disabled');
	        }
	    } else {
	        $.each($.contextMenu.menus, function () {
	            if (this.selector === $t.selector) {
	                $o.data = this;

	                $.extend($o.data, { trigger: 'demand' });
	            }
	        });

	        $.contextMenu.handle.contextmenu.call($o.target, $o);
	    }

	    return this;
	};

	/***/ })
	/******/ ]);
	}); 
} (jquery_contextMenu));

var jquery_contextMenuExports = jquery_contextMenu.exports;

var MidiLearnMode;
(function (MidiLearnMode) {
    /** Accept all messages matching the input device from the MIDI learn message. */
    MidiLearnMode["INPUT"] = "input";
    /** Accept all messages matching the input device and status from the MIDI learn message. */
    MidiLearnMode["STATUS"] = "status";
    /** Accept all messages matching the input device, status, and the first message byte (ex: pitch) from the MIDI learn message. */
    MidiLearnMode["FIRST_BYTE"] = "first-byte";
})(MidiLearnMode || (MidiLearnMode = {}));
const NULL_OP = (...args) => void 0;
class MidiLearn {
    constructor({ learnMode = MidiLearnMode.STATUS, contextMenuSelector = undefined, onMidiLearnConnection = NULL_OP, onMidiMessage = NULL_OP } = {}) {
        this.isInMidiLearnMode = false;
        this.learnMode = learnMode;
        this.onMidiLearnConnection = onMidiLearnConnection;
        this.onMidiMessage = onMidiMessage;
        contextMenuSelector && this.addMidiLearnContextMenu(contextMenuSelector);
        this.$contextMenu = contextMenuSelector ? $(contextMenuSelector) : undefined;
        this.midiMessageListener = new MidiMessageListener(this.midiMessageHandler.bind(this));
    }
    addMidiLearnContextMenu(contextMenuSelector) {
        const contextMenu = new jquery_contextMenuExports.ContextMenu();
        contextMenu.create({
            selector: contextMenuSelector,
            items: {
                enter: {
                    name: "Midi Learn",
                    callback: () => {
                        if (this.isInMidiLearnMode)
                            this.exitMidiLearnMode();
                        else
                            this.enterMidiLearnMode();
                    }
                }
            }
        });
    }
    enterMidiLearnMode() {
        var _a;
        this.isInMidiLearnMode = true;
        (_a = this.$contextMenu) === null || _a === void 0 ? void 0 : _a.removeClass(constants.MIDI_LEARN_ASSIGNED_CLASS).addClass(constants.MIDI_LEARN_LISTENING_CLASS);
        // Exit on escape.
        window.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                this.exitMidiLearnMode();
            }
        }, { once: true });
    }
    exitMidiLearnMode() {
        var _a;
        this.isInMidiLearnMode = false;
        (_a = this.$contextMenu) === null || _a === void 0 ? void 0 : _a.removeClass(constants.MIDI_LEARN_LISTENING_CLASS);
    }
    matchesLearnedFilter(input, event) {
        var _a, _b, _c, _d, _e;
        if (event.data == null)
            return false;
        const inputMatches = ((_a = this.learnedMidiInput) === null || _a === void 0 ? void 0 : _a.id) == input.id;
        const statusMatch = inputMatches && (this.learnMode == MidiLearnMode.INPUT
            || ((_c = (_b = this.learnedMidiEvent) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c[0]) == event.data[0]);
        const firstByteMatch = statusMatch && (this.learnMode != MidiLearnMode.FIRST_BYTE
            || ((_e = (_d = this.learnedMidiEvent) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e[1]) == event.data[1]);
        return firstByteMatch;
    }
    midiMessageHandler(input, event) {
        var _a;
        if (event.data == null)
            return;
        if (this.isInMidiLearnMode) {
            this.learnedMidiInput = input;
            this.learnedMidiEvent = event;
            this.onMidiLearnConnection(input, event.data);
            this.onMidiMessage(event);
            (_a = this.$contextMenu) === null || _a === void 0 ? void 0 : _a.addClass(constants.MIDI_LEARN_ASSIGNED_CLASS);
            this.exitMidiLearnMode();
        }
        else if (this.matchesLearnedFilter(input, event)) {
            this.onMidiMessage(event);
        }
    }
}
MidiLearn.Mode = MidiLearnMode;

// TODO: Fix all the displays to work with BaseDisplay.
class BaseDisplay {
    constructor(component) {
        this.component = component;
    }
    assertInitialized() {
        if (typeof $ == 'undefined') {
            throw new Error("JQuery is required to display UI components.");
        }
    }
    _refreshDisplay(input, newValue) {
        throw new Error("Not implemented!");
    }
}

var __classPrivateFieldGet$5 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _VisualComponent_instances, _a$1, _VisualComponent_addBypassIndicator, _VisualComponent_assertDisplayIsUsable;
class VisualComponent extends BaseComponent {
    constructor() {
        super();
        _VisualComponent_instances.add(this);
        this.uniqueDomSelector = "#" + this._uuid;
    }
    static adjustSize($root) {
        const maxHeight = $root.children().get().reduce((acc, curr) => {
            var _b;
            const top = +$(curr).css('top').replace('px', '');
            const height = (_b = $(curr).outerHeight(true)) !== null && _b !== void 0 ? _b : 0;
            return Math.max(acc, top + height);
        }, 0);
        const maxWidth = $root.children().get().reduce((acc, curr) => {
            var _b;
            const left = +$(curr).css('left').replace('px', '');
            const width = (_b = $(curr).outerWidth(true)) !== null && _b !== void 0 ? _b : 0;
            return Math.max(acc, left + width);
        }, 0);
        $root.css({
            height: `${maxHeight}px`,
            width: `${maxWidth}px`
        });
    }
    static rotate($container, rotateDeg) {
        var _b, _c;
        $container.css({
            "transform-origin": "top left",
            transform: `rotate(${rotateDeg}deg)`
        });
        const parentRect = (_b = $container.parent().get(0)) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
        const rect = (_c = $container.get(0)) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect();
        if (rect == undefined || parentRect == undefined) {
            throw new Error("Both $container and its parent must exist.");
        }
        const top = +$container.css("top").replace("px", "");
        const left = +$container.css("left").replace("px", "");
        $container.css({
            top: top - rect.top + parentRect.top,
            left: left - rect.left + parentRect.left
        });
    }
    addToDom(iaRootElement, { left = 0, top = 0, width = undefined, height = undefined, rotateDeg = 0 } = {}) {
        var _b, _c;
        __classPrivateFieldGet$5(this, _VisualComponent_instances, "m", _VisualComponent_assertDisplayIsUsable).call(this);
        const cls = this.constructor;
        width !== null && width !== void 0 ? width : (width = (_b = cls.defaultWidth) !== null && _b !== void 0 ? _b : 0);
        height !== null && height !== void 0 ? height : (height = (_c = cls.defaultHeight) !== null && _c !== void 0 ? _c : 0);
        // Root.
        this.$root = $(iaRootElement).addClass('ia-root');
        if (!this.$root.length) {
            throw new Error(`No element found for ${iaRootElement}.`);
        }
        // Container.
        this.$container = $(document.createElement('div'));
        this.$container
            .addClass(constants.COMPONENT_CONTAINER_CLASS)
            .addClass(`ia-${this._className}`)
            .attr('title', `${this._className} (#${this._uuid})`)
            .addClass('component')
            .addClass(constants.UNINITIALIZED_CLASS)
            .prop('id', this._uuid);
        this.$bypassIndicator = __classPrivateFieldGet$5(_a$1, _a$1, "m", _VisualComponent_addBypassIndicator).call(_a$1, this.$container);
        this.$container.css({ width, height, top, left });
        // Main component
        const $component = this.$container;
        $component.removeClass(constants.UNINITIALIZED_CLASS);
        // Define structure.
        this.$root.append(this.$container);
        //this.$container.append($component)
        this.display._display(this.$container, width, height);
        afterRender(() => {
            _a$1.adjustSize(this.$root);
            _a$1.rotate(this.$container, rotateDeg);
        });
        return $component;
    }
    refreshDom() {
        throw new Error("TODO: Remove refreshDom. Individual methods should be written instead.");
    }
    onMuteEvent(event) {
        if (this.$container) {
            if (event.shouldMute) {
                this.$container.addClass(constants.MUTED_CLASS);
            }
            else {
                this.$container.removeClass(constants.MUTED_CLASS);
            }
        }
    }
    onBypassEvent(event) {
        var _b, _c;
        if (this.$container) {
            if (event.shouldBypass) {
                this.$container.addClass(constants.BYPASSED_CLASS);
                (_b = this.$bypassIndicator) === null || _b === void 0 ? void 0 : _b.show();
            }
            else {
                this.$container.removeClass(constants.BYPASSED_CLASS);
                (_c = this.$bypassIndicator) === null || _c === void 0 ? void 0 : _c.hide();
            }
        }
    }
}
_a$1 = VisualComponent, _VisualComponent_instances = new WeakSet(), _VisualComponent_addBypassIndicator = function _VisualComponent_addBypassIndicator($container) {
    const $bypassIndicator = $(document.createElement('span'))
        .addClass(constants.BYPASS_INDICATOR_CLASS);
    $container.append($bypassIndicator);
    return $bypassIndicator;
}, _VisualComponent_assertDisplayIsUsable = function _VisualComponent_assertDisplayIsUsable() {
    if (this.display == undefined || !(this.display instanceof BaseDisplay)) {
        throw new Error(`No display logic found: invalid ${this._className}.display value. Each VisualComponent must define a 'display' property of type BaseDisplay.`);
    }
    this.display.assertInitialized();
};

class Bang extends VisualComponent {
    constructor() {
        super();
        this.lastMidiValue = 0;
        this.display = new this._.BangDisplay(this);
        this.output = this.defineControlOutput('output');
        this.preventIOOverwrites();
        // Trigger on nonzero MIDI inputs.
        this.midiLearn = new MidiLearn({
            contextMenuSelector: this.uniqueDomSelector,
            learnMode: MidiLearn.Mode.FIRST_BYTE,
            onMidiMessage: this.handleMidiInput.bind(this)
        });
    }
    handleMidiInput(event) {
        if (event.data == null)
            return;
        const midiValue = event.data[2];
        if (midiValue) {
            if (!this.lastMidiValue) {
                this.trigger();
                this.display.showPressed();
            }
        }
        else {
            this.display.showUnpressed();
        }
        this.lastMidiValue = midiValue;
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (input instanceof ControlInput) {
            this.output.connect(input);
        }
        else if (component != undefined) {
            this.output.connect(component.triggerInput);
        }
        else {
            throw new Error(`Unable to connect to ${destination} because it is not a ControlInput and has no associated component.`);
        }
        return component;
    }
    trigger() {
        this.output.setValue(constants.TRIGGER);
    }
}
// Display options. TODO: move to display class?
Bang.defaultHeight = 48;
Bang.defaultWidth = 48;

const BUFFER_WRITER_WORKLET_NAME = "buffer-writer-worklet";

class BufferWriterComponent extends BaseComponent {
    constructor(buffer) {
        var _a;
        super();
        const numChannels = (_a = buffer === null || buffer === void 0 ? void 0 : buffer.numberOfChannels) !== null && _a !== void 0 ? _a : 2;
        this.worklet = new AudioWorkletNode(this.audioContext, BUFFER_WRITER_WORKLET_NAME, {
            numberOfInputs: 2,
            numberOfOutputs: 0,
            processorOptions: {
                buffer,
                bufferId: buffer ? getBufferId(buffer) : undefined
            }
        });
        // @ts-ignore Property undefined.
        this.worklet['__numInputChannels'] = numChannels;
        // @ts-ignore Property undefined.
        this.worklet['__numOutputChannels'] = numChannels;
        this.worklet.port.onmessage = event => {
            this.handleMessage(event.data);
        };
        const positionGain = this.audioContext.createGain();
        const valueGain = this.audioContext.createGain();
        positionGain.connect(this.worklet, undefined, 0);
        valueGain.connect(this.worklet, undefined, 1);
        // Input
        this.position = this.defineAudioInput('position', positionGain);
        this.valueToWrite = this.defineAudioInput('valueToWrite', valueGain);
        this.buffer = this.defineControlInput('buffer', buffer, true).ofType(AudioBuffer);
        buffer && this.setBuffer(buffer);
    }
    get bufferId() {
        return getBufferId(this.buffer.value);
    }
    setBuffer(buffer) {
        this.worklet.port.postMessage({
            buffer: bufferToFloat32Arrays(buffer),
            bufferId: this.bufferId
        });
    }
    // Update buffer in-place. This will be called periodically from the worklet 
    // thread.
    handleMessage(floatData) {
        const buffer = this.buffer.value;
        floatData.map((channel, i) => buffer.copyToChannel(channel, i));
    }
}

class ChannelSplitter extends BaseComponent {
    constructor(...inputChannelGroups) {
        super();
        this.outputChannels = [];
        this.inputChannelGroups = inputChannelGroups;
        this.length = inputChannelGroups.length;
        this.splitter = this.audioContext.createChannelSplitter();
        this.input = this.defineAudioInput('input', this.splitter);
        this.createMergedOutputs(inputChannelGroups);
    }
    createMergedOutputs(inputChannelGroups) {
        if (inputChannelGroups.length > 32) {
            throw new Error("Can only split into 32 or fewer channels.");
        }
        for (let i = 0; i < inputChannelGroups.length; i++) {
            const mergedNode = this.mergeChannels(inputChannelGroups[i]);
            this[i] = this.defineAudioOutput("" + i, mergedNode);
            this.outputChannels.push(this[i]);
        }
    }
    mergeChannels(channels) {
        const merger = this.audioContext.createChannelMerger(channels.length);
        for (let c = 0; c < channels.length; c++) {
            // The N input channels of the merger will contain the selected output
            // channels of the splitter.
            this.splitter.connect(merger, channels[c], c);
        }
        return merger;
    }
    [Symbol.iterator]() {
        let index = 0;
        const items = this.outputChannels;
        return {
            next() {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                }
                else {
                    return { value: 0, done: true };
                }
            },
        };
    }
}

const PRIVATE_CONSTRUCTOR = Symbol("PRIVATE_CONSTRUCTOR");
class ChannelStacker extends BaseComponent {
    constructor(numChannelsPerInput, __privateConstructorCall) {
        super();
        this.stackedInputs = [];
        if (__privateConstructorCall !== PRIVATE_CONSTRUCTOR) {
            throw new Error("ChannelStacker cannot be constructed directly. Use ChannelStacker.fromInputs instead.");
        }
        const numOutputChannels = numChannelsPerInput.reduce((a, b) => a + b);
        const merger = this.audioContext.createChannelMerger(numOutputChannels);
        let outChannel = 0;
        for (let i = 0; i < numChannelsPerInput.length; i++) {
            const splitter = this.audioContext.createChannelSplitter();
            // Route inputs to outputs
            for (let inChannel = 0; inChannel < numChannelsPerInput[i]; inChannel++) {
                splitter.connect(merger, inChannel, outChannel);
                outChannel++;
            }
            const input = this.defineAudioInput("" + i, splitter);
            this.stackedInputs.push(input);
            this[i] = input;
        }
        this.output = this.defineAudioOutput('output', merger);
    }
    static fromInputs(destinations) {
        const numChannelsPerInput = [];
        const inputObj = {};
        for (let i = 0; i < destinations.length; i++) {
            let output = destinations[i];
            if (output instanceof BaseComponent && output.defaultOutput) {
                output = output.defaultOutput;
            }
            if (!(output instanceof HybridOutput || output instanceof AudioRateOutput)) {
                throw new Error(`A ChannelStacker can only be created from audio-rate outputs. Given ${destinations[i]}, which is not an audio-rate outputs nor a component with a default audio-rate outputs.`);
            }
            numChannelsPerInput.push(output.numOutputChannels);
            inputObj[i] = destinations[i];
        }
        const stacker = new this._.ChannelStacker(numChannelsPerInput, PRIVATE_CONSTRUCTOR);
        return stacker.withInputs(inputObj);
    }
}

class ControlToAudioConverter extends BaseComponent {
    constructor() {
        super();
        this.input = this.defineControlInput('input');
        this.node = createConstantSource(this.audioContext);
        this.output = this.defineAudioOutput('output', this.node);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.input) {
            this.node.offset.setValueAtTime(newValue, 0);
        }
    }
}

// TODO: create shared base class with AudioTransformComponent.
class FunctionComponent extends BaseComponent {
    constructor(fn) {
        super();
        this.fn = fn;
        this._orderedFunctionInputs = [];
        const descriptor = describeFunction(fn);
        const parameters = descriptor.parameters;
        for (let i = 0; i < parameters.length; i++) {
            const arg = parameters[i];
            const inputName = "$" + arg.name;
            const indexName = "$" + i;
            const isRequired = !arg.hasDefault;
            if (arg.destructureType == "rest") {
                // Can't use it or anything after it
                break;
            }
            else if (arg.destructureType) {
                throw new Error(`Invalid function for FunctionComponent. Parameters cannot use array or object destructuring. Given: ${arg.rawName}`);
            }
            // Define input and its alias.
            // @ts-ignore Improper index type.
            this[inputName] = this.defineControlInput(inputName, constants.UNSET_VALUE, isRequired);
            // @ts-ignore Improper index type.
            this[indexName] = this.defineInputAlias(indexName, this[inputName]);
            // @ts-ignore Improper index type.
            this._orderedFunctionInputs.push(this[inputName]);
        }
        let requiredArgs = parameters.filter((a) => !a.hasDefault);
        if (requiredArgs.length == 1) {
            // @ts-ignore Improper index type.
            this.setDefaultInput(this["$" + requiredArgs[0].name]);
        }
        this.output = this.defineControlOutput('output');
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        const args = this._orderedFunctionInputs.map(eachInput => eachInput.value);
        const result = this.fn(...args);
        this.output.setValue(result);
    }
    __call__(...inputs) {
        return this.withInputs(...inputs);
    }
    withInputs(...inputs) {
        var _a;
        let inputDict = {};
        if ((_a = inputs[0]) === null || _a === void 0 ? void 0 : _a.connect) { // instanceof Connectable
            if (inputs.length > this._orderedFunctionInputs.length) {
                throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`);
            }
            for (let i = 0; i < inputs.length; i++) {
                inputDict["$" + i] = inputs[i];
            }
        }
        else {
            inputDict = inputs[0];
        }
        super.withInputs(inputDict);
        return this;
    }
}

class CompoundInput extends AbstractInput {
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get keys() {
        return new Set(Object.keys(this.inputs));
    }
    get defaultInput() {
        return this._defaultInput;
    }
    constructor(name, parent, inputs, defaultInput) {
        super(name, parent, false);
        this.name = name;
        this.parent = parent;
        this.activeChannel = undefined;
        this.inputs = {};
        let hasMultichannelInput = false;
        // Define 'this.inputs' and 'this' interface for underlying inputs.
        Object.keys(inputs).map(name => {
            const input = inputs[name];
            hasMultichannelInput || (hasMultichannelInput = input instanceof AudioRateInput && input.audioSink instanceof AudioNode);
            if (Object.prototype.hasOwnProperty(name)) {
                console.warn(`Cannot create top-level CompoundInput property '${name}' because it is reserved. Use 'inputs.${name}' instead.`);
            }
            for (const obj of [this, this.inputs]) {
                Object.defineProperty(obj, name, {
                    get() {
                        return (this.activeChannel != undefined && input instanceof AudioRateInput) ? input.channels[this.activeChannel] : input;
                    },
                    enumerable: true
                });
            }
        });
        this.channels = createMultiChannelView(this, hasMultichannelInput);
        this._defaultInput = defaultInput;
    }
    mapOverInputs(fn) {
        const res = {};
        for (const inputName of this.keys) {
            res[inputName] = fn(this.inputs[inputName], inputName);
        }
        return res;
    }
    get numInputChannels() {
        const ic = this.mapOverInputs(i => i.numInputChannels);
        return Math.max(...Object.values(ic));
    }
    get value() {
        return this.mapOverInputs(input => input.value);
    }
    setValue(value) {
        if (isPlainObject(value) && Object.keys(value).every(k => this.keys.has(k))) {
            // If each key is a valid value, assign it as such.
            this.mapOverInputs((input, name) => input.setValue(value[name]));
        }
        else if (this.defaultInput) {
            // Assume it's an input for the default input.
            this.defaultInput.setValue(value);
        }
        else {
            throw new Error(`The given compound input (${this}) has no default input, so setValue expected a plain JS object with keys equal to a subset of ${[...this.keys]}. Given: ${value} (${JSON.stringify(value)}). Did you intend to call setValue of one of its named inputs (.inputs[inputName])instead?`);
        }
    }
}

class CompoundOutput extends AbstractOutput {
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (input instanceof CompoundInput) {
            // First priority: try to connect all to same-named inputs.
            // TODO: could this requirement be configured to allow connection either:
            // - When inputs are a superset
            // - When any input matches
            // TODO: might be good to check the types are compatible as well.
            const inputIsSuperset = [...this.keys].every(v => input.keys.has(v));
            if (inputIsSuperset) {
                for (const key of this.keys) {
                    this.outputs[key].connect(input.inputs[key]);
                }
            }
        }
        else if (this.defaultOutput) {
            // Second priority: connect only default.
            // TODO: implement logic in each "sub-output" connect handler.
            this.defaultOutput.connect(input);
        }
        return component;
    }
    get keys() {
        return new Set(Object.keys(this.outputs));
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get defaultOutput() {
        return this._defaultOutput;
    }
    constructor(name, outputs, parent, defaultOutput) {
        super(name, parent);
        this.name = name;
        this.parent = parent;
        this.activeChannel = undefined;
        this.outputs = {};
        this._defaultOutput = defaultOutput;
        let hasMultichannelInput = false;
        // Define 'this.outputs' and 'this' interface for underlying inputs.
        Object.keys(outputs).map(name => {
            const output = outputs[name];
            hasMultichannelInput || (hasMultichannelInput = output instanceof AudioRateOutput);
            if (Object.prototype.hasOwnProperty(name)) {
                console.warn(`Cannot create top-level CompoundOutput property '${name}' because it is reserved. Use 'outputs.${name}' instead.`);
            }
            for (const obj of [this, this.outputs]) {
                Object.defineProperty(obj, name, {
                    get() {
                        return (this.activeChannel != undefined && output instanceof AudioRateOutput) ? output.channels[this.activeChannel] : output;
                    },
                    enumerable: true
                });
            }
        });
        this.channels = createMultiChannelView(this, hasMultichannelInput);
    }
    mapOverOutputs(fn) {
        const res = {};
        for (const outputName of this.keys) {
            res[outputName] = fn(this.outputs[outputName], outputName);
        }
        return res;
    }
    get numOutputChannels() {
        const ic = this.mapOverOutputs(i => i.numOutputChannels);
        return Math.max(...Object.values(ic));
    }
}

class FFTOutput extends CompoundOutput {
    // TODO: add fftSize, etc.
    constructor(name, magnitude, phase, sync, parent, fftSize = 128) {
        super(name, { magnitude, phase, sync }, parent);
        this.name = name;
        this.parent = parent;
        this.fftSize = fftSize;
    }
    ifft() {
        const component = new this._.IFFTComponent(this.fftSize);
        this.connect(component.fftIn);
        return component;
    }
}

// fft.js from https://github.com/indutny/fft.js/tree/master
// @ts-ignore
(function (t) { function r(e) { if (i[e])
    return i[e].exports; var o = i[e] = { i: e, l: !1, exports: {} }; return t[e].call(o.exports, o, o.exports, r), o.l = !0, o.exports; } var i = {}; return r.m = t, r.c = i, r.i = function (t) { return t; }, r.d = function (t, i, e) { r.o(t, i) || Object.defineProperty(t, i, { configurable: !1, enumerable: !0, get: e }); }, r.n = function (t) { var i = t && t.__esModule ? function () { return t.default; } : function () { return t; }; return r.d(i, "a", i), i; }, r.o = function (t, r) { return Object.prototype.hasOwnProperty.call(t, r); }, r.p = "", r(r.s = 0); })([function (t, r, i) {
        function e(t) { if (this.size = 0 | t, this.size <= 1 || 0 != (this.size & this.size - 1))
            throw new Error("FFT size must be a power of two and bigger than 1"); this._csize = t << 1; for (var r = new Array(2 * this.size), i = 0; i < r.length; i += 2) {
            var e = Math.PI * i / this.size;
            r[i] = Math.cos(e), r[i + 1] = -Math.sin(e);
        } this.table = r; for (var o = 0, n = 1; this.size > n; n <<= 1)
            o++; this._width = o % 2 == 0 ? o - 1 : o, this._bitrev = new Array(1 << this._width); for (var s = 0; s < this._bitrev.length; s++) {
            this._bitrev[s] = 0;
            for (var a = 0; a < this._width; a += 2) {
                var h = this._width - a - 2;
                this._bitrev[s] |= (s >>> a & 3) << h;
            }
        } this._out = null, this._data = null, this._inv = 0; }
        t.exports = e, e.prototype.fromComplexArray = function (t, r) { for (var i = r || new Array(t.length >>> 1), e = 0; e < t.length; e += 2)
            i[e >>> 1] = t[e]; return i; }, e.prototype.createComplexArray = function () { for (var t = new Array(this._csize), r = 0; r < t.length; r++)
            t[r] = 0; return t; }, e.prototype.toComplexArray = function (t, r) { for (var i = r || this.createComplexArray(), e = 0; e < i.length; e += 2)
            i[e] = t[e >>> 1], i[e + 1] = 0; return i; }, e.prototype.completeSpectrum = function (t) { for (var r = this._csize, i = r >>> 1, e = 2; e < i; e += 2)
            t[r - e] = t[e], t[r - e + 1] = -t[e + 1]; }, e.prototype.transform = function (t, r) { if (t === r)
            throw new Error("Input and output buffers must be different"); this._out = t, this._data = r, this._inv = 0, this._transform4(), this._out = null, this._data = null; }, e.prototype.realTransform = function (t, r) { if (t === r)
            throw new Error("Input and output buffers must be different"); this._out = t, this._data = r, this._inv = 0, this._realTransform4(), this._out = null, this._data = null; }, e.prototype.inverseTransform = function (t, r) { if (t === r)
            throw new Error("Input and output buffers must be different"); this._out = t, this._data = r, this._inv = 1, this._transform4(); for (var i = 0; i < t.length; i++)
            t[i] /= this.size; this._out = null, this._data = null; }, e.prototype._transform4 = function () { var t, r, i = this._out, e = this._csize, o = this._width, n = 1 << o, s = e / n << 1, a = this._bitrev; if (4 === s)
            for (t = 0, r = 0; t < e; t += s, r++) {
                var h = a[r];
                this._singleTransform2(t, h, n);
            }
        else
            for (t = 0, r = 0; t < e; t += s, r++) {
                var f = a[r];
                this._singleTransform4(t, f, n);
            } var u = this._inv ? -1 : 1, _ = this.table; for (n >>= 2; n >= 2; n >>= 2) {
            s = e / n << 1;
            var l = s >>> 2;
            for (t = 0; t < e; t += s)
                for (var p = t + l, v = t, c = 0; v < p; v += 2, c += n) {
                    var d = v, m = d + l, y = m + l, b = y + l, w = i[d], g = i[d + 1], z = i[m], T = i[m + 1], x = i[y], A = i[y + 1], C = i[b], E = i[b + 1], F = w, I = g, M = _[c], R = u * _[c + 1], O = z * M - T * R, P = z * R + T * M, j = _[2 * c], S = u * _[2 * c + 1], J = x * j - A * S, k = x * S + A * j, q = _[3 * c], B = u * _[3 * c + 1], D = C * q - E * B, G = C * B + E * q, H = F + J, K = I + k, L = F - J, N = I - k, Q = O + D, U = P + G, V = u * (O - D), W = u * (P - G), X = H + Q, Y = K + U, Z = H - Q, $ = K - U, tt = L + W, rt = N - V, it = L - W, et = N + V;
                    i[d] = X, i[d + 1] = Y, i[m] = tt, i[m + 1] = rt, i[y] = Z, i[y + 1] = $, i[b] = it, i[b + 1] = et;
                }
        } }, e.prototype._singleTransform2 = function (t, r, i) { var e = this._out, o = this._data, n = o[r], s = o[r + 1], a = o[r + i], h = o[r + i + 1], f = n + a, u = s + h, _ = n - a, l = s - h; e[t] = f, e[t + 1] = u, e[t + 2] = _, e[t + 3] = l; }, e.prototype._singleTransform4 = function (t, r, i) { var e = this._out, o = this._data, n = this._inv ? -1 : 1, s = 2 * i, a = 3 * i, h = o[r], f = o[r + 1], u = o[r + i], _ = o[r + i + 1], l = o[r + s], p = o[r + s + 1], v = o[r + a], c = o[r + a + 1], d = h + l, m = f + p, y = h - l, b = f - p, w = u + v, g = _ + c, z = n * (u - v), T = n * (_ - c), x = d + w, A = m + g, C = y + T, E = b - z, F = d - w, I = m - g, M = y - T, R = b + z; e[t] = x, e[t + 1] = A, e[t + 2] = C, e[t + 3] = E, e[t + 4] = F, e[t + 5] = I, e[t + 6] = M, e[t + 7] = R; }, e.prototype._realTransform4 = function () { var t, r, i = this._out, e = this._csize, o = this._width, n = 1 << o, s = e / n << 1, a = this._bitrev; if (4 === s)
            for (t = 0, r = 0; t < e; t += s, r++) {
                var h = a[r];
                this._singleRealTransform2(t, h >>> 1, n >>> 1);
            }
        else
            for (t = 0, r = 0; t < e; t += s, r++) {
                var f = a[r];
                this._singleRealTransform4(t, f >>> 1, n >>> 1);
            } var u = this._inv ? -1 : 1, _ = this.table; for (n >>= 2; n >= 2; n >>= 2) {
            s = e / n << 1;
            var l = s >>> 1, p = l >>> 1, v = p >>> 1;
            for (t = 0; t < e; t += s)
                for (var c = 0, d = 0; c <= v; c += 2, d += n) {
                    var m = t + c, y = m + p, b = y + p, w = b + p, g = i[m], z = i[m + 1], T = i[y], x = i[y + 1], A = i[b], C = i[b + 1], E = i[w], F = i[w + 1], I = g, M = z, R = _[d], O = u * _[d + 1], P = T * R - x * O, j = T * O + x * R, S = _[2 * d], J = u * _[2 * d + 1], k = A * S - C * J, q = A * J + C * S, B = _[3 * d], D = u * _[3 * d + 1], G = E * B - F * D, H = E * D + F * B, K = I + k, L = M + q, N = I - k, Q = M - q, U = P + G, V = j + H, W = u * (P - G), X = u * (j - H), Y = K + U, Z = L + V, $ = N + X, tt = Q - W;
                    if (i[m] = Y, i[m + 1] = Z, i[y] = $, i[y + 1] = tt, 0 !== c) {
                        if (c !== v) {
                            var rt = N, it = -Q, et = K, ot = -L, nt = -u * X, st = -u * W, at = -u * V, ht = -u * U, ft = rt + nt, ut = it + st, _t = et + ht, lt = ot - at, pt = t + p - c, vt = t + l - c;
                            i[pt] = ft, i[pt + 1] = ut, i[vt] = _t, i[vt + 1] = lt;
                        }
                    }
                    else {
                        var ct = K - U, dt = L - V;
                        i[b] = ct, i[b + 1] = dt;
                    }
                }
        } }, e.prototype._singleRealTransform2 = function (t, r, i) { var e = this._out, o = this._data, n = o[r], s = o[r + i], a = n + s, h = n - s; e[t] = a, e[t + 1] = 0, e[t + 2] = h, e[t + 3] = 0; }, e.prototype._singleRealTransform4 = function (t, r, i) { var e = this._out, o = this._data, n = this._inv ? -1 : 1, s = 2 * i, a = 3 * i, h = o[r], f = o[r + i], u = o[r + s], _ = o[r + a], l = h + u, p = h - u, v = f + _, c = n * (f - _), d = l + v, m = p, y = -c, b = l - v, w = p, g = c; e[t] = d, e[t + 1] = 0, e[t + 2] = m, e[t + 3] = y, e[t + 4] = b, e[t + 5] = 0, e[t + 6] = w, e[t + 7] = g; };
    }]);

const FFT_WORKLET_NAME = "fft-worklet";
const IFFT_WORKLET_NAME = "ifft-worklet";

class FFTComponent extends BaseComponent {
    constructor(fftSize = 128) {
        super();
        this.fftSize = fftSize;
        this.worklet = new AudioWorkletNode(this.audioContext, FFT_WORKLET_NAME, {
            numberOfInputs: 2,
            numberOfOutputs: 3,
            processorOptions: { useComplexValuedFft: false, fftSize }
        });
        // Inputs
        // TODO: make audio inputs and outputs support connecting to different input
        // numbers so these GainNodes aren't necessary.
        const realGain = this.audioContext.createGain();
        const imaginaryGain = this.audioContext.createGain();
        this.realInput = this.defineAudioInput('realInput', realGain);
        this.imaginaryInput = this.defineAudioInput('imaginaryInput', imaginaryGain);
        this.setDefaultInput(this.realInput);
        const magnitudeGain = this.audioContext.createGain();
        const phaseGain = this.audioContext.createGain();
        const syncGain = this.audioContext.createGain();
        // Output
        this.fftOut = new FFTOutput('fftOut', new AudioRateOutput('magnitude', magnitudeGain, this), new AudioRateOutput('phase', phaseGain, this), new AudioRateOutput('sync', syncGain, this), this, this.fftSize);
        this.defineInputOrOutput('fftOut', this.fftOut, this.outputs);
        realGain.connect(this.worklet, undefined, 0);
        imaginaryGain.connect(this.worklet, undefined, 1);
        this.worklet.connect(syncGain, 0);
        this.worklet.connect(magnitudeGain, 1);
        this.worklet.connect(phaseGain, 2);
    }
    ifft() {
        return this.fftOut.ifft();
    }
}

// TODO: remove.
// Could this be generalized to a "compound input", of which this is just a 
// subclass?
class FFTInput extends CompoundInput {
    // TODO: add fftSize etc.
    constructor(name, parent, magnitude, phase, sync) {
        super(name, parent, { magnitude, phase, sync });
        this.name = name;
        this.parent = parent;
    }
}

class IFFTComponent extends BaseComponent {
    constructor(fftSize = 128) {
        super();
        this.fftSize = fftSize;
        this.worklet = new AudioWorkletNode(this.audioContext, IFFT_WORKLET_NAME, {
            numberOfInputs: 3,
            numberOfOutputs: 2,
            processorOptions: { useComplexValuedFft: false, fftSize }
        });
        // Inputs
        // TODO: make audio inputs and outputs support connecting to different input
        // numbers so these GainNodes aren't necessary.
        const magnitudeGain = this.audioContext.createGain();
        const phaseGain = this.audioContext.createGain();
        const syncGain = this.audioContext.createGain();
        this.fftIn = new FFTInput('fftIn', this, new AudioRateInput('magnitude', this, magnitudeGain), new AudioRateInput('phase', this, phaseGain), new AudioRateInput('sync', this, syncGain));
        this.defineInputOrOutput('fftIn', this.fftIn, this.inputs);
        // Outputs
        const realGain = this.audioContext.createGain();
        const imaginaryGain = this.audioContext.createGain();
        this.realOutput = this.defineAudioOutput('realOutput', realGain);
        this.imaginaryOutput = this.defineAudioOutput('imaginaryOutput', imaginaryGain);
        this.setDefaultOutput(this.realOutput);
        syncGain.connect(this.worklet, undefined, 0);
        magnitudeGain.connect(this.worklet, undefined, 1);
        phaseGain.connect(this.worklet, undefined, 2);
        this.worklet.connect(realGain, 0);
        this.worklet.connect(imaginaryGain, 1);
    }
}

/**
 * Represents a group of components that can be operated on independently.
 */
class BundleComponent extends BaseComponent {
    constructor(components) {
        super();
        if (components instanceof Array) {
            this.componentValues = components;
            this.componentObject = {};
            for (let i = 0; i < components.length; i++) {
                this.componentObject[i] = components[i];
            }
        }
        else {
            this.componentValues = Object.values(components);
            this.componentObject = components;
        }
        for (const key in this.componentObject) {
            // @ts-ignore No index signature.
            // TODO: export intersection with index signature type.
            this[key] = this.componentObject[key];
            this.defineInputAlias(key, this.componentObject[key].getDefaultInput());
            if (this.componentObject[key].defaultOutput) {
                this.defineOutputAlias(key, this.componentObject[key].defaultOutput);
            }
        }
        this.input = this.defineCompoundInput('input', map(this.componentObject, c => c.defaultInput));
        this.setDefaultInput(this.input);
        this.output = this.defineCompoundOutput('output', map(this.componentObject, c => c.defaultOutput));
        this.setDefaultOutput(this.output);
        this.length = this.componentValues.length;
    }
    get isControlStream() {
        return this.componentValues.every(c => c.isControlStream);
    }
    get isAudioStream() {
        return this.componentValues.every(c => c.isAudioStream);
    }
    get isStftStream() {
        return this.componentValues.every(c => c.isStftStream);
    }
    [Symbol.iterator]() {
        return this.componentValues[Symbol.iterator]();
    }
    getDefaultInput() {
        throw new Error("Method not implemented.");
    }
    get defaultOutput() {
        return undefined;
    }
    get numOutputChannels() {
        return Math.max(...this.componentValues.map(c => c.numOutputChannels)) || 0;
    }
    get numInputChannels() {
        return Math.max(...this.componentValues.map(c => c.numInputChannels)) || 0;
    }
    setBypassed(isBypassed) {
        this.getBundledResult('setBypassed', isBypassed);
    }
    setMuted(isMuted) {
        this.getBundledResult('setMuted', isMuted);
    }
    getBundledResult(fnName, ...inputs) {
        const returnValues = {};
        for (const key in this.componentObject) {
            returnValues[key] = this.componentObject[key][fnName](...inputs);
        }
        return new BundleComponent(returnValues);
    }
    connect(destination) {
        let { component } = this.getDestinationInfo(destination);
        if (isType(component, FunctionComponent)
            || isType(component, AudioTransformComponent)) {
            try {
                return component.withInputs(this.componentObject);
            }
            catch (_a) {
                // Try with ordered inputs if named inputs don't match.
                return component.withInputs(this.componentValues);
            }
        }
        const bundledResult = this.getBundledResult('connect', destination);
        // All entries will be the same, so just return the first.
        return Object.values(bundledResult)[0];
    }
    withInputs(inputDict) {
        this.getBundledResult('withInputs', inputDict);
        return this;
    }
    setValues(valueObj) {
        return this.getBundledResult('setValues', valueObj);
    }
    wasConnectedTo(source) {
        this.getBundledResult('wasConnectedTo', source);
        return source;
    }
    // TODO: doesn't work.
    sampleSignal(samplePeriodMs) {
        return this.getBundledResult('sampleSignal', samplePeriodMs);
    }
    propagateUpdatedInput(input, newValue) {
        return this.getBundledResult('propagateUpdatedInput', input, newValue);
    }
}

class IgnoreDuplicates extends BaseComponent {
    constructor() {
        super();
        this.input = this.defineControlInput('input');
        this.output = this.defineControlOutput('output');
    }
    // @ts-ignore ControlInput<T> doesn't cover all of base AbstractInput<T>
    inputDidUpdate(input, newValue) {
        if (newValue != this.value) {
            this.output.setValue(newValue);
            this.value = newValue;
        }
    }
}

class Keyboard extends VisualComponent {
    constructor(numKeys = 48, lowestPitch = 48) {
        super();
        this.display = new this._.KeyboardDisplay(this);
        // Inputs
        this.numKeys = this.defineControlInput('numKeys', numKeys);
        this.lowestPitch = this.defineControlInput('lowestPitch', lowestPitch);
        this.midiInput = this.defineControlInput('midiInput');
        this.setDefaultInput(this.midiInput);
        // Output
        this.midiOutput = this.defineControlOutput('midiOutput');
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.numKeys || input == this.lowestPitch) {
            //this.refreshDom()
            throw new Error("Can't update numKeys or lowestPitch yet.");
        }
        if (input == this.midiInput) {
            // Show key being pressed.
            this.display.showKeyEvent(newValue);
            // Propagate.
            this.midiOutput.setValue(newValue);
        }
    }
    get highestPitch() {
        return this.lowestPitch.value + this.numKeys.value;
    }
    getKeyId(keyNumber) {
        return `${this._uuid}-k${keyNumber}`; // Unique identifier.
    }
    keyDown(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_DOWN, keyNumber, 64, this.getKeyId(keyNumber)));
    }
    keyUp(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_UP, keyNumber, 64, this.getKeyId(keyNumber)));
    }
}
// Display options. TODO: move to display class?
Keyboard.defaultHeight = 64;
Keyboard.defaultWidth = 256;

class MediaElementComponent extends BaseComponent {
    constructor(selectorOrElement, { preservePitchOnStretch = false } = {}) {
        super();
        this.mediaElement = $(selectorOrElement).get(0);
        this.audioNode = this.audioContext.createMediaElementSource(this.mediaElement);
        this.mediaElement.disableRemotePlayback = false;
        this.mediaElement.preservesPitch = preservePitchOnStretch;
        this.start = this.defineControlInput('start');
        this.stop = this.defineControlInput('stop');
        this.playbackRate = this.defineControlInput('playbackRate');
        this.volume = this.defineControlInput('volume');
        this.audioOutput = this.defineAudioOutput('audioOutput', this.audioNode);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.start) {
            this.mediaElement.pause();
        }
        else if (input == this.stop) {
            this.mediaElement.play();
        }
        else if (input == this.playbackRate) {
            this.mediaElement.playbackRate = Math.max(constants.MIN_PLAYBACK_RATE, Math.min(newValue, constants.MAX_PLAYBACK_RATE));
        }
        else if (input == this.volume) {
            this.mediaElement.volume = newValue;
        }
    }
}

class SelectDisplay extends BaseDisplay {
    _display($root) {
        // Create dropdown
        this.$select = $(document.createElement('select'))
            .appendTo($root)
            .on('change', e => {
            this.component.setOption(e.currentTarget.value);
        });
        this.populateOptions();
    }
    populateOptions() {
        if (this.$select == undefined)
            return;
        this.$select.empty();
        for (const { id, name: value } of this.component.selectOptions) {
            const $option = $(document.createElement('option'))
                .prop('value', id)
                .text(value);
            this.$select.append($option);
        }
        const id = this.component.selectedId;
        this.$select.find(`option[value="${id}"`).prop('selected', true);
    }
    refresh() {
        this.populateOptions();
    }
}

var DefaultDeviceBehavior;
(function (DefaultDeviceBehavior) {
    DefaultDeviceBehavior["NONE"] = "none";
    DefaultDeviceBehavior["ALL"] = "all";
    DefaultDeviceBehavior["NEWEST"] = "newest";
})(DefaultDeviceBehavior || (DefaultDeviceBehavior = {}));
const NO_INPUT_ID = 'none';
const ALL_INPUT_ID = 'all';
const SELECT_NO_DEVICE = { id: NO_INPUT_ID, name: "<no midi input>" };
const SELECT_ALL_DEVICES = { id: ALL_INPUT_ID, name: "* (all midi inputs)" };
const DEFAULT_SELECTIONS = [SELECT_NO_DEVICE, SELECT_ALL_DEVICES];
class MidiInputDevice extends VisualComponent {
    constructor(defaultDeviceBehavior = DefaultDeviceBehavior.ALL) {
        super();
        this.defaultDeviceBehavior = defaultDeviceBehavior;
        // Used by display.
        this.selectOptions = DEFAULT_SELECTIONS;
        // Internals.
        this.deviceMap = {};
        this.display = new SelectDisplay(this);
        this.selectedDeviceInput = this.defineControlInput('selectedDeviceInput');
        this.midiOut = this.defineControlOutput('midiOut');
        this.availableDevices = this.defineControlOutput('availableDevices');
        this.activeDevices = this.defineControlOutput('selectedDevicesOutput');
        // Update the menu and outputs when access changes.
        this.accessListener = new MidiAccessListener(this.onMidiAccessChange.bind(this));
        // Send filtered MIDI messages out.
        this.messageListener = new MidiMessageListener(this.sendMidiMessage.bind(this));
        // Context menu triggers MIDI learn mode: select the MIDI input based 
        // on which input device is currently being used.
        this.midiLearn = new MidiLearn({
            learnMode: MidiLearn.Mode.INPUT,
            contextMenuSelector: this.uniqueDomSelector,
            onMidiLearnConnection: input => this.selectDevice(input.id)
        });
    }
    static buildSelectOptions(inputMap) {
        var _a;
        const selectOptions = [...DEFAULT_SELECTIONS];
        for (const id in inputMap) {
            const name = `${(_a = inputMap[id].manufacturer) !== null && _a !== void 0 ? _a : ''} ${inputMap[id].name}`;
            selectOptions.push({ id, name });
        }
        return selectOptions;
    }
    getSelectedMidiDevicesById(id) {
        if (id == NO_INPUT_ID) {
            return [];
        }
        else if (id == ALL_INPUT_ID) {
            return Object.values(this.deviceMap);
        }
        return [this.deviceMap[id]];
    }
    selectDevice(id) {
        if (id != this.selectedId) {
            this.selectedId = id;
            const devices = this.getSelectedMidiDevicesById(id);
            this.activeDevices.setValue(devices);
        }
        // Update display.
        this.display.refresh();
    }
    onMidiAccessChange(access, event) {
        var _a, _b;
        if (((_a = event === null || event === void 0 ? void 0 : event.port) === null || _a === void 0 ? void 0 : _a.type) === "output") {
            return; // We only care about input changes.
        }
        // Set available inputs.
        this.deviceMap = mapLikeToObject(access.inputs);
        this.availableDevices.setValue(this.deviceMap, true);
        this.selectOptions = MidiInputDevice.buildSelectOptions(this.deviceMap);
        // Set selected input(s).
        const newId = (_b = this.autoSelectNewDevice(this.deviceMap, event)) !== null && _b !== void 0 ? _b : NO_INPUT_ID;
        this.selectDevice(newId);
    }
    autoSelectNewDevice(deviceMap, event) {
        var _a, _b, _c;
        const inputs = Object.values(deviceMap);
        if (this.defaultDeviceBehavior instanceof Function) {
            // Custom selector function.
            const chosenInput = this.defaultDeviceBehavior(inputs);
            return chosenInput === null || chosenInput === void 0 ? void 0 : chosenInput.id;
        }
        // Catch special case where user-selected option has precedence.
        const isSpecialId = [ALL_INPUT_ID, NO_INPUT_ID].includes(this.selectedId);
        const selectedDeviceIsAvailable = this.selectedId && inputs.some(input => input.id == this.selectedId);
        if ((selectedDeviceIsAvailable || isSpecialId)
            && this.defaultDeviceBehavior !== DefaultDeviceBehavior.NEWEST) {
            // No change. The only mode in which the previously-selected option would 
            // update is NEWEST.
            return this.selectedId;
        }
        switch (this.defaultDeviceBehavior) {
            case DefaultDeviceBehavior.NEWEST:
                if (this.selectedId === ALL_INPUT_ID) {
                    // The user explicitly selected using "all", so don't box them in.
                    return this.selectedId;
                }
                else if (((_a = event === null || event === void 0 ? void 0 : event.port) === null || _a === void 0 ? void 0 : _a.state) === "connected") {
                    // Connect to the new device.
                    return event.port.id;
                }
                else if (((_b = event === null || event === void 0 ? void 0 : event.port) === null || _b === void 0 ? void 0 : _b.state) === "disconnected" && event.port.id !== this.selectedId) {
                    // Disconnection was irrelevant; keep same device.
                    return this.selectedId;
                }
                else {
                    // Disconnection was relevant OR we are choosing an initial device
                    // (event === undefined).
                    return (_c = inputs[inputs.length - 1]) === null || _c === void 0 ? void 0 : _c.id;
                }
            case DefaultDeviceBehavior.ALL:
                return ALL_INPUT_ID;
            default: // NONE
                return NO_INPUT_ID;
        }
    }
    sendMidiMessage(midiInput, e) {
        if (e.data == null)
            return;
        if ([midiInput.id, ALL_INPUT_ID].includes(this.selectedId)) {
            const [cmd, key, v] = e.data;
            this.midiOut.setValue([cmd, key, v]);
        }
    }
    inputDidUpdate(input, newValue) {
        if (input == this.selectedDeviceInput) {
            this.setOption(newValue);
            this.display.refresh();
        }
    }
    setOption(id) {
        this.selectDevice(id);
    }
}

class RangeInputComponent extends VisualComponent {
    constructor(minValue = 0, maxValue = 1, step, defaultValue, displayType = RangeType.SLIDER) {
        super();
        this.display = (displayType == RangeType.SLIDER)
            ? new this._.SliderDisplay(this)
            : new this._.KnobDisplay(this);
        if (defaultValue == undefined) {
            defaultValue = minValue;
        }
        // Inputs
        this.minValue = this.defineControlInput('minValue', minValue);
        this.maxValue = this.defineControlInput('maxValue', maxValue);
        this.step = this.defineControlInput('step', step);
        this.input = this.defineControlInput('input', defaultValue);
        this.setDefaultInput(this.input);
        // Output
        this.output = this.defineControlOutput('output');
        // Update slider on messages from Midi-learned control.
        this.midiLearn = new MidiLearn({
            learnMode: MidiLearn.Mode.FIRST_BYTE,
            contextMenuSelector: this.uniqueDomSelector,
            onMidiMessage: this.handleMidiUpdate.bind(this)
        });
    }
    handleMidiUpdate(event) {
        if (event.data == null)
            return;
        const uInt8Value = event.data[2]; // Velocity / value.
        const scaledValue = scaleRange(uInt8Value, [0, 127], [this.minValue.value, this.maxValue.value]);
        this.updateValue(scaledValue);
    }
    updateValue(newValue) {
        this.display.updateValue(newValue);
        this.output.setValue(newValue);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.input) {
            this.updateValue(newValue);
        }
        else if (input == this.minValue) {
            this.display.updateMinValue(newValue);
        }
        else if (input == this.maxValue) {
            this.display.updateMaxValue(newValue);
        }
        else if (input == this.step) {
            this.display.updateStep(newValue);
        }
    }
}
RangeInputComponent.Type = RangeType;

// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 
var __classPrivateFieldGet$4 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ScrollingAudioMonitor_instances, _ScrollingAudioMonitor_addToMemory;
// one that captures N samples and displays them all at the same time.
class ScrollingAudioMonitor extends VisualComponent {
    constructor(samplePeriodMs, memorySize = 128, minValue = 'auto', maxValue = 'auto', hideZeroSignal = true, numChannels = 6) {
        super();
        _ScrollingAudioMonitor_instances.add(this);
        this._memory = []; // Channel * time.
        this._analyzers = [];
        samplePeriodMs !== null && samplePeriodMs !== void 0 ? samplePeriodMs : (samplePeriodMs = this.config.defaultSamplePeriodMs);
        this.display = new this._.ScrollingAudioMonitorDisplay(this);
        this._splitter = this.audioContext.createChannelSplitter();
        this._merger = this.audioContext.createChannelMerger();
        // Inputs
        this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs); // TODO: make work again.
        this.memorySize = this.defineControlInput('memorySize', memorySize);
        this.minValue = this.defineControlInput('minValue', minValue);
        this.maxValue = this.defineControlInput('maxValue', maxValue);
        this.hideZeroSignal = this.defineControlInput('hideZeroSignal', hideZeroSignal);
        this.input = this.defineAudioInput('input', this._splitter);
        this.setDefaultInput(this.input);
        // It seems a subgraph including analyzers may be optimized out when the 
        // sink itself is not an analyzer. So add a no-op analyzer sink to keep the
        // signal flowing.
        this._merger.connect(this.audioContext.createAnalyser());
        // Output
        this.audioOutput = this.defineAudioOutput('audioOutput', this._merger);
        this.setDefaultOutput(this.audioOutput);
        this.controlOutput = this.defineControlOutput('controlOutput');
        // Audio routing
        for (let i = 0; i < numChannels; i++) {
            const analyzer = this.audioContext.createAnalyser();
            this._splitter.connect(analyzer, i, 0).connect(this._merger, 0, i);
            this._analyzers.push(analyzer);
            this._memory.push(Array(this.memorySize.value).fill(0.));
        }
        // Define animation loop
        const updateSignalValues = () => {
            const channelValues = [];
            for (let i = 0; i < numChannels; i++) {
                // Get i'th channel info.
                const dataArray = new Float32Array(128);
                this._analyzers[i].getFloatTimeDomainData(dataArray);
                const v = dataArray[0];
                __classPrivateFieldGet$4(this, _ScrollingAudioMonitor_instances, "m", _ScrollingAudioMonitor_addToMemory).call(this, this._memory[i], v);
                channelValues.push(v);
            }
            this.display.updateWaveformDisplay();
            this.controlOutput.setValue(channelValues);
            requestAnimationFrame(updateSignalValues);
        };
        updateSignalValues();
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.memorySize) {
            throw new Error("Can't update memorySize yet.");
        }
        else if (input == this.samplePeriodMs) ;
    }
    getCurrentValueRange() {
        let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory.map(a => Math.min(...a))) : this.minValue.value;
        let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory.map(a => Math.max(...a))) : this.maxValue.value;
        let isEmptyRange = (minValue == maxValue);
        if (!Number.isFinite(minValue) || isEmptyRange) {
            minValue = -1;
        }
        if (!Number.isFinite(maxValue) || isEmptyRange) {
            maxValue = 1;
        }
        return { minValue, maxValue };
    }
}
_ScrollingAudioMonitor_instances = new WeakSet(), _ScrollingAudioMonitor_addToMemory = function _ScrollingAudioMonitor_addToMemory(arr, v) {
    arr.push(v);
    if (arr.length > this.memorySize.value) {
        arr.shift();
    }
};
// Display options. TODO: move to display class?
ScrollingAudioMonitor.defaultHeight = 64;
ScrollingAudioMonitor.defaultWidth = 256;

var __classPrivateFieldGet$3 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SimplePolyphonicSynth_instances, _SimplePolyphonicSynth_createOscillatorGraph;
class SimplePolyphonicSynth extends BaseComponent {
    constructor(numNotes = 4, waveform = WaveType.SINE) {
        super();
        _SimplePolyphonicSynth_instances.add(this);
        this._soundNodes = [];
        this._currNodeIdx = 0;
        this._masterGainNode = this.audioContext.createGain();
        // Inputs
        this.numNotes = this.defineControlInput('numNotes', numNotes);
        this.waveform = this.defineControlInput('waveform', waveform);
        this.midiInput = this.defineControlInput('midiInput');
        this.setDefaultInput(this.midiInput);
        // Output
        this.audioOutput = this.defineAudioOutput('audioOutput', this._masterGainNode);
        for (let i = 0; i < numNotes; i++) {
            this._soundNodes.push(__classPrivateFieldGet$3(this, _SimplePolyphonicSynth_instances, "m", _SimplePolyphonicSynth_createOscillatorGraph).call(this, this.waveform.value));
        }
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.midiInput) {
            this.onKeyEvent(newValue);
        }
        // TODO: fill in the rest.
    }
    onKeyEvent(event) {
        // Need better solution than this.
        let freq = 440 * Math.pow(2, ((event.eventPitch - 69) / 12));
        if (event.eventType == KeyEventType.KEY_DOWN) {
            let node = this._soundNodes[this._currNodeIdx];
            node.isPlaying && node.oscillator.stop();
            node.oscillator = this.audioContext.createOscillator();
            node.oscillator.connect(node.gainNode);
            node.oscillator.frequency.value = freq;
            node.gainNode.gain.value = event.eventVelocity / 128;
            node.oscillator.start();
            node.key = event.key;
            node.isPlaying = true;
            this._currNodeIdx = (this._currNodeIdx + 1) % this.numNotes.value;
        }
        else if (event.eventType == KeyEventType.KEY_UP) {
            for (let node of this._soundNodes) {
                if (event.key && (event.key == node.key)) {
                    node.oscillator.stop();
                    node.isPlaying = false;
                }
            }
        }
        else {
            throw new Error("invalid keyevent");
        }
    }
}
_SimplePolyphonicSynth_instances = new WeakSet(), _SimplePolyphonicSynth_createOscillatorGraph = function _SimplePolyphonicSynth_createOscillatorGraph(waveform) {
    let oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    let gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this._masterGainNode);
    this._masterGainNode.gain.setValueAtTime(1 / this.numNotes.value, this.now());
    return {
        oscillator: oscillator,
        gainNode: gainNode,
        isPlaying: false,
        // Unique identifier to help associate NOTE_OFF events with the correct
        // oscillator.
        key: undefined
    };
};

class SlowDown extends BaseComponent {
    constructor(rate = 1, bufferLengthSec = 60) {
        super();
        this.rate = rate;
        this.bufferLengthSec = bufferLengthSec;
        this.delayNode = this.audioContext.createDelay(bufferLengthSec);
        //this.delayNode.delayTime.setValueAtTime(bufferLengthSec, 0)
        this.delayModulator = createConstantSource(this.audioContext);
        this.delayModulator.connect(this.delayNode.delayTime);
        this.audioInput = this.defineAudioInput('audioInput', this.delayNode);
        this.audioOutput = this.defineAudioOutput('audioOutput', this.delayNode);
        this.rampOut = this.defineAudioOutput('rampOut', this.delayModulator);
    }
    start() {
        defineTimeRamp(this.audioContext, TimeMeasure.SECONDS, this.delayModulator, this.mapFn.bind(this));
    }
    mapFn(v) {
        return v * (1 - this.rate);
    }
}

class TimeVaryingSignal extends AudioTransformComponent {
    constructor(generatorFn, timeMeasure = TimeMeasure.SECONDS) {
        super(generatorFn, { inputSpec: new StreamSpec({ numChannelsPerStream: [1] }) });
        const timeRamp = defineTimeRamp(this.audioContext, timeMeasure);
        timeRamp.connect(this.executionContext.inputs[0]);
        this.preventIOOverwrites();
    }
}
TimeVaryingSignal.TimeMeasure = TimeMeasure;

var __classPrivateFieldGet$2 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TypingKeyboardMIDI_instances, _a, _TypingKeyboardMIDI_registerKeyHandlers, _TypingKeyboardMIDI_getPitchFromKey;
const _MIDI_C0 = 12;
class TypingKeyboardMIDI extends BaseComponent {
    constructor(velocity = 64, octave = 4) {
        super();
        _TypingKeyboardMIDI_instances.add(this);
        // Inputs
        this.velocity = this.defineControlInput('velocity', velocity);
        this.octaveInput = this.defineControlInput('octaveInput', octave);
        this.midiInput = this.defineControlInput('midiInput', constants.UNSET_VALUE, false);
        this.setDefaultInput(this.midiInput);
        // Output
        this.midiOutput = this.defineControlOutput('midiOutput');
        this.octaveOutput = this.defineControlOutput('octaveOutput');
        this.setDefaultOutput(this.midiOutput);
        this.preventIOOverwrites();
        this.validateIsSingleton();
        __classPrivateFieldGet$2(this, _TypingKeyboardMIDI_instances, "m", _TypingKeyboardMIDI_registerKeyHandlers).call(this);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.octaveInput) {
            this.octaveOutput.setValue(newValue);
        }
        else if (input == this.midiInput) {
            // Passthrough, as MIDI does not affect component state.
            this.midiOutput.setValue(newValue);
        }
    }
}
_a = TypingKeyboardMIDI, _TypingKeyboardMIDI_instances = new WeakSet(), _TypingKeyboardMIDI_registerKeyHandlers = function _TypingKeyboardMIDI_registerKeyHandlers() {
    const keyPressedMap = {};
    const processKeyEvent = (event) => {
        var _b;
        if (event.defaultPrevented) {
            return;
        }
        const key = event.key;
        const isAlreadyPressed = (_b = keyPressedMap[key]) === null || _b === void 0 ? void 0 : _b.isPressed;
        const isKeyDown = (event.type == KeyEventType.KEY_DOWN);
        let pitch;
        if (isAlreadyPressed) {
            if (isKeyDown) {
                // Extra keydown events are sent for holding, so ignore.
                return;
            }
            else {
                // The pitch of the press may be different than the current pitch,
                // so send a note-off for that one instead.
                pitch = keyPressedMap[key].pitch;
            }
        }
        else {
            pitch = __classPrivateFieldGet$2(this, _TypingKeyboardMIDI_instances, "m", _TypingKeyboardMIDI_getPitchFromKey).call(this, key, isKeyDown);
        }
        if (pitch != undefined) {
            keyPressedMap[key] = {
                isPressed: isKeyDown,
                pitch: pitch
            };
            let id = this._uuid + key + pitch;
            this.midiOutput.setValue(new KeyEvent(event.type, pitch, this.velocity.value, id));
        }
    };
    window.addEventListener("keydown", processKeyEvent, true);
    window.addEventListener("keyup", processKeyEvent, true);
}, _TypingKeyboardMIDI_getPitchFromKey = function _TypingKeyboardMIDI_getPitchFromKey(key, isKeyDown) {
    const baseCPitch = _MIDI_C0 + this.octaveInput.value * 12;
    const chromaticIdx = _a.CHROMATIC_KEY_SEQUENCE.indexOf(key);
    if (chromaticIdx != -1) {
        return chromaticIdx + baseCPitch;
    }
    else if (isKeyDown && key == _a.OCTAVE_DOWN_KEY) {
        // The octaveOutput will automatically be updated
        this.octaveInput.setValue(this.octaveInput.value - 1);
    }
    else if (isKeyDown && key == _a.OCTAVE_UP_KEY) {
        this.octaveInput.setValue(this.octaveInput.value + 1);
    }
};
TypingKeyboardMIDI.OCTAVE_DOWN_KEY = "z";
TypingKeyboardMIDI.OCTAVE_UP_KEY = "x";
TypingKeyboardMIDI.CHROMATIC_KEY_SEQUENCE = "awsedftgyhujkolp;'"; // C to F

class Wave extends BaseComponent {
    constructor(wavetableOrType, frequency) {
        super();
        let waveType;
        let wavetable;
        if (wavetableOrType instanceof PeriodicWave) {
            wavetable = wavetableOrType;
            waveType = WaveType.CUSTOM;
        }
        else if (Object.values(Wave.Type).includes(wavetableOrType)) {
            waveType = wavetableOrType;
        }
        this._oscillatorNode = new OscillatorNode(this.audioContext, {
            type: waveType,
            frequency: frequency,
            periodicWave: wavetable
        });
        this._oscillatorNode.start();
        this.type = this.defineControlInput('type', waveType).ofType(String);
        this.waveTable = this.defineControlInput('waveTable', wavetable).ofType(PeriodicWave);
        this.frequency = this.defineAudioInput('frequency', this._oscillatorNode.frequency).ofType(Number);
        this.output = this.defineAudioOutput('output', this._oscillatorNode);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.waveTable) {
            this._oscillatorNode.setPeriodicWave(newValue);
        }
        else if (input == this.type) {
            // TODO: figure this out.
            this._oscillatorNode.type = newValue;
        }
    }
    static fromPartials(frequency, magnitudes, phases) {
        let realCoefficients = [];
        let imagCoefficients = [];
        for (let i = 0; i < magnitudes.length; i++) {
            let theta = (phases && phases[i]) ? phases[i] : 0;
            let r = magnitudes[i];
            realCoefficients.push(r * Math.cos(theta));
            imagCoefficients.push(r * Math.sin(theta));
        }
        // this == class in static contexts.
        return this.fromCoefficients(frequency, realCoefficients, imagCoefficients);
    }
    static fromCoefficients(frequency, real, imaginary) {
        imaginary !== null && imaginary !== void 0 ? imaginary : (imaginary = [...real].map(_ => 0));
        const wavetable = this.audioContext.createPeriodicWave(real, imaginary);
        return new this._.Wave(wavetable, frequency);
    }
}
Wave.Type = WaveType;

class BangDisplay extends BaseDisplay {
    _display($root, width, height) {
        this.$button = $(document.createElement('button'))
            .on('click', () => {
            this.component.trigger();
        }).css({
            width: width,
            height: height,
        })
            .attr('type', 'button')
            .addClass(constants.BANG_CLASS)
            .appendTo($root);
    }
    showPressed(duration) {
        var _a;
        (_a = this.$button) === null || _a === void 0 ? void 0 : _a.addClass(constants.BANG_PRESSED_CLASS);
        if (duration) {
            setTimeout(this.showUnpressed.bind(this), duration);
        }
    }
    showUnpressed() {
        var _a;
        (_a = this.$button) === null || _a === void 0 ? void 0 : _a.removeClass(constants.BANG_PRESSED_CLASS);
    }
}
BangDisplay.PRESS_DURATION_MS = 100;

class KeyboardDisplay extends BaseDisplay {
    constructor() {
        super(...arguments);
        this.$keys = {};
    }
    _display($root, width, height) {
        // Obviously this is the wrong keyboard arrangement. TODO: that.
        let keyWidth = width / this.component.numKeys.value;
        this.$keys = {};
        const lo = this.component.lowestPitch.value;
        const hi = this.component.highestPitch;
        for (let pitch = lo; pitch < hi; pitch++) {
            let $key = $(document.createElement('button'))
                .addClass(constants.KEYBOARD_KEY_CLASS)
                .css({
                width: keyWidth,
                height: height,
            })
                .attr('type', 'button')
                // Keydown handled locally
                .on(constants.EVENT_MOUSEDOWN, () => this.component.keyDown(pitch));
            this.$keys[pitch] = $key;
            $root.append($key);
        }
        // Key releases are handled globally to prevent releasing when not on a 
        // button (doesn't trigger mouseup on the button).
        // TODO: isn't this inefficient to propogate 48 updates on one keydown...? 
        $root.on(constants.EVENT_MOUSEUP, () => {
            Object.keys(this.$keys).forEach(k => this.component.keyUp(+k));
        });
    }
    showKeyEvent(event) {
        let $key = this.$keys[event.eventPitch];
        if ($key) {
            if (event.eventType == KeyEventType.KEY_DOWN) {
                $key.addClass(constants.KEYBOARD_KEY_PRESSED_CLASS);
            }
            else {
                $key.removeClass(constants.KEYBOARD_KEY_PRESSED_CLASS);
            }
        }
    }
}

var __classPrivateFieldGet$1 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SliderDisplay_instances, _SliderDisplay_getInputAttrs;
class RangeInputDisplay extends BaseDisplay {
    updateValue(value) { }
    updateMinValue(value) { }
    updateMaxValue(value) { }
    updateStep(value) { }
}
class KnobDisplay extends RangeInputDisplay {
    _display($root, width, height) {
        throw new Error("Not implemented!");
    }
}
class SliderDisplay extends RangeInputDisplay {
    constructor() {
        super(...arguments);
        _SliderDisplay_instances.add(this);
    }
    _display($root, width, height) {
        this.$range = $(document.createElement('input'))
            .attr(__classPrivateFieldGet$1(this, _SliderDisplay_instances, "m", _SliderDisplay_getInputAttrs).call(this))
            .on('input', event => {
            this.component.output.setValue(Number(event.target.value));
        }).css({
            width: width,
            height: height,
        });
        $root.append(this.$range);
    }
    updateValue(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('value', value);
    }
    updateMinValue(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('min', value);
    }
    updateMaxValue(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('max', value);
    }
    updateStep(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('step', value);
    }
}
_SliderDisplay_instances = new WeakSet(), _SliderDisplay_getInputAttrs = function _SliderDisplay_getInputAttrs() {
    return {
        type: 'range',
        min: this.component.minValue.value,
        max: this.component.maxValue.value,
        step: this.component.step.value || 'any',
        value: this.component.input.value,
    };
};

var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ScrollingAudioMonitorDisplay_instances, _ScrollingAudioMonitorDisplay_valueToDisplayableText, _ScrollingAudioMonitorDisplay_displayWaveform;
class ScrollingAudioMonitorDisplay extends BaseDisplay {
    constructor() {
        super(...arguments);
        _ScrollingAudioMonitorDisplay_instances.add(this);
    }
    _display($container, width, height) {
        let size = {
            width: width,
            height: height,
        };
        this.$canvas = $(document.createElement('canvas')).css(size).attr(size);
        this.$minValueDisplay = $(document.createElement('span'))
            .addClass(constants.MONITOR_VALUE_CLASS)
            .css("bottom", "5px");
        this.$maxValueDisplay = $(document.createElement('span'))
            .addClass(constants.MONITOR_VALUE_CLASS)
            .css("top", "5px");
        $container.append(this.$canvas, this.$minValueDisplay, this.$maxValueDisplay);
        this.$container = $container;
        this.updateWaveformDisplay();
    }
    updateWaveformDisplay() {
        var _a, _b;
        if (this.$container) {
            const { minValue, maxValue } = this.component.getCurrentValueRange();
            if (minValue != this.currMinValue) {
                (_a = this.$minValueDisplay) === null || _a === void 0 ? void 0 : _a.text(__classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_valueToDisplayableText).call(this, minValue));
                this.currMinValue = minValue;
            }
            if (maxValue != this.currMaxValue) {
                (_b = this.$maxValueDisplay) === null || _b === void 0 ? void 0 : _b.text(__classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_valueToDisplayableText).call(this, maxValue));
                this.currMaxValue = maxValue;
            }
            __classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_displayWaveform).call(this, minValue, maxValue);
        }
    }
    drawSingleWaveform(ctx, values, strokeStyle, toX, toY) {
        // Draw graph
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        for (let i = 0; i < values.length; i++) {
            if (this.component.hideZeroSignal.value) {
                if (values[i]) {
                    ctx.lineTo(toX(i), toY(values[i]));
                    ctx.stroke();
                }
                else {
                    ctx.beginPath();
                }
            }
            else {
                // undefined if out of the memory range.
                if (values[i] != undefined) {
                    ctx.lineTo(toX(i), toY(values[i]));
                    ctx.stroke();
                }
                else {
                    ctx.beginPath();
                }
            }
        }
    }
}
_ScrollingAudioMonitorDisplay_instances = new WeakSet(), _ScrollingAudioMonitorDisplay_valueToDisplayableText = function _ScrollingAudioMonitorDisplay_valueToDisplayableText(value) {
    if (value === "auto") {
        return "";
    }
    else {
        return value.toFixed(2);
    }
}, _ScrollingAudioMonitorDisplay_displayWaveform = function _ScrollingAudioMonitorDisplay_displayWaveform(minValue, maxValue) {
    var _a, _b;
    if (!this.$canvas) {
        throw new Error("$canvas must be defined.");
    }
    let maxX = Number(this.$canvas.attr('width'));
    let memory = this.component._memory;
    let memLength = memory[0].length;
    let entryWidth = maxX / memLength;
    let maxY = Number(this.$canvas.attr('height'));
    const canvas = this.$canvas[0];
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Unable to load 2d Canvas context.");
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let hasOutOfBoundsValues = false;
    const toX = (i) => i * entryWidth;
    const toY = (v) => {
        const coordValue = scaleRange(v, [minValue, maxValue], [maxY, 0]);
        const isOutOfBounds = !!(v && ((coordValue > maxY) || (coordValue < 0)));
        hasOutOfBoundsValues || (hasOutOfBoundsValues = isOutOfBounds);
        return coordValue;
    };
    // Draw 0 line
    const zeroY = toY(0);
    if (zeroY <= maxY) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(maxX, zeroY);
        ctx.stroke();
    }
    for (let i = memory.length - 1; i >= 0; i--) {
        const whiteVal = Math.pow((i / memory.length), 0.5) * 255;
        this.drawSingleWaveform(ctx, memory[i], `rgb(${whiteVal}, ${whiteVal}, ${whiteVal})`, toX, toY);
    }
    // Warn user visually if the range of the signal is not captured.
    if (hasOutOfBoundsValues) {
        (_a = this.$container) === null || _a === void 0 ? void 0 : _a.addClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS);
    }
    else {
        (_b = this.$container) === null || _b === void 0 ? void 0 : _b.removeClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS);
    }
};

// TODO: transform constructors and some functions to take in objects instead 
// of a list of parameters (can't specify named parameters)

var internals = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ADSR: ADSR,
    AbstractInput: AbstractInput,
    AbstractOutput: AbstractOutput,
    AudioComponent: AudioComponent,
    AudioExecutionContext: AudioExecutionContext,
    AudioRateInput: AudioRateInput,
    AudioRateOutput: AudioRateOutput,
    AudioRateSignalSampler: AudioRateSignalSampler,
    AudioRecordingComponent: AudioRecordingComponent,
    AudioTransformComponent: AudioTransformComponent,
    Bang: Bang,
    BangDisplay: BangDisplay,
    BaseComponent: BaseComponent,
    BaseConnectable: BaseConnectable,
    BaseDisplay: BaseDisplay,
    BaseEvent: BaseEvent,
    BufferComponent: BufferComponent,
    BufferWriterComponent: BufferWriterComponent,
    BundleComponent: BundleComponent,
    BypassEvent: BypassEvent,
    ChannelSplitter: ChannelSplitter,
    ChannelStacker: ChannelStacker,
    ComponentInput: ComponentInput,
    CompoundInput: CompoundInput,
    CompoundOutput: CompoundOutput,
    ControlInput: ControlInput,
    ControlOutput: ControlOutput,
    ControlToAudioConverter: ControlToAudioConverter,
    get DefaultDeviceBehavior () { return DefaultDeviceBehavior; },
    Disconnect: Disconnect,
    FFTComponent: FFTComponent,
    FFTInput: FFTInput,
    FFTOutput: FFTOutput,
    FunctionComponent: FunctionComponent,
    HybridInput: HybridInput,
    HybridOutput: HybridOutput,
    IFFTComponent: IFFTComponent,
    IgnoreDuplicates: IgnoreDuplicates,
    KeyEvent: KeyEvent,
    get KeyEventType () { return KeyEventType; },
    Keyboard: Keyboard,
    KeyboardDisplay: KeyboardDisplay,
    KnobDisplay: KnobDisplay,
    MediaElementComponent: MediaElementComponent,
    MidiAccessListener: MidiAccessListener,
    MidiInputDevice: MidiInputDevice,
    MidiLearn: MidiLearn,
    MidiMessageListener: MidiMessageListener,
    MuteEvent: MuteEvent,
    RangeInputComponent: RangeInputComponent,
    RangeInputDisplay: RangeInputDisplay,
    get RangeType () { return RangeType; },
    ScriptProcessorExecutionContext: ScriptProcessorExecutionContext,
    ScrollingAudioMonitor: ScrollingAudioMonitor,
    ScrollingAudioMonitorDisplay: ScrollingAudioMonitorDisplay,
    SimplePolyphonicSynth: SimplePolyphonicSynth,
    SliderDisplay: SliderDisplay,
    SlowDown: SlowDown,
    get TimeMeasure () { return TimeMeasure; },
    TimeVaryingSignal: TimeVaryingSignal,
    ToStringAndUUID: ToStringAndUUID,
    TypedConfigurable: TypedConfigurable,
    TypingKeyboardMIDI: TypingKeyboardMIDI,
    VisualComponent: VisualComponent,
    Wave: Wave,
    get WaveType () { return WaveType; },
    WorkletExecutionContext: WorkletExecutionContext,
    connectWebAudioChannels: connectWebAudioChannels,
    constants: constants,
    createMultiChannelView: createMultiChannelView,
    disconnect: disconnect,
    events: events,
    getNumInputChannels: getNumInputChannels,
    getNumOutputChannels: getNumOutputChannels,
    lazyProperty: lazyProperty,
    resolvePromiseArgs: resolvePromiseArgs,
    util: util
});

// TODO: Specify only a subset for public use
var publicNamespace = Object.assign({}, internals);

function numberToString(n) {
    return n >= 0.1 ? n.toPrecision(4) : n.toExponential(4);
}
function getFormattedChannelData(node) {
    const values = node.analyzers.map(getCurrentSignalValue);
    const valueStrings = values.map(numberToString).join(", ");
    return node.formatString.replace(/\{\w*\}/g, `[${valueStrings}]`);
}
function getCurrentSignalValue(analyzer) {
    const dataArray = new Float32Array(1);
    analyzer.getFloatTimeDomainData(dataArray);
    return dataArray[0];
}
class SignalLogger extends ToStringAndUUID {
    constructor(samplePeriodMs = 1000) {
        super();
        this.samplePeriodMs = samplePeriodMs;
        this.analysers = [];
        this.start();
    }
    start() {
        this.stop();
        this.interval = window.setInterval(() => {
            const messages = this.analysers.map(getFormattedChannelData);
            const logString = messages.join("\n");
            console.log(logString);
        }, this.samplePeriodMs);
    }
    stop() {
        clearInterval(this.interval);
    }
    /**
     * Register a node to be monitored.
     */
    register(output, formatString) {
        const splitter = this.audioContext.createChannelSplitter(output.numOutputChannels);
        output.connect(splitter);
        const analyzers = [];
        for (const i of range(output.numOutputChannels)) {
            const analyzer = this.audioContext.createAnalyser();
            splitter.connect(analyzer, i);
            analyzers.push(analyzer);
        }
        this.analysers.push({ formatString, analyzers });
    }
}

// lazy-init to 
let logger;
const defaultConfig = {
    audioContext: new AudioContext(),
    state: {
        isInitialized: false,
        workletIsAvailable: false
    },
    get logger() {
        return logger !== null && logger !== void 0 ? logger : (logger = new SignalLogger());
    },
    defaultSamplePeriodMs: 10,
    useWorkletByDefault: false,
    workletPath: "dist/worklet.js"
};

var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const baseWithConfig = main$1.registerAndCreateFactoryFn(defaultConfig, publicNamespace, Object.assign({}, internals));
const USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"];
class IATopLevel {
    constructor(config, internals$1) {
        this.config = config;
        this.internals = internals$1;
        this.gestureListeners = [];
        this.runCalled = false;
        this.out = new this.internals.AudioRateInput('out', undefined, config.audioContext.destination);
        this.util = util;
    }
    get audioContext() {
        return this.config.audioContext;
    }
    createInitListeners() {
        const workletPromise = this.audioContext.audioWorklet.addModule(this.config.workletPath);
        const initAfterAsync = () => {
            workletPromise.then(() => this.init(true), () => this.init(false));
        };
        for (const gesture of USER_GESTURES) {
            document.addEventListener(gesture, initAfterAsync, { once: true });
        }
    }
    init(workletAvailable) {
        if (this.config.state.isInitialized)
            return;
        this.config.state.isInitialized = true;
        this.config.state.workletIsAvailable = workletAvailable;
        workletAvailable || console.warn(`Unable to load worklet file from ${this.config.workletPath}. Worklet-based processing will be disabled. Verify the workletPath configuration setting is set correctly and the file is available.`);
        this.config.audioContext.resume();
        for (const listener of this.gestureListeners) {
            listener(this.config.audioContext);
        }
    }
    /**
     * Register a function to be called once the audio engine is ready and a user gesture has been performed.
     *
     * @param callback A function to run once the audio engine is ready.
     */
    run(callback) {
        if (!this.runCalled)
            this.createInitListeners();
        this.runCalled = true;
        if (this.config.state.isInitialized) {
            callback(this.config.audioContext);
        }
        else {
            this.gestureListeners.push(callback);
        }
    }
    withConfig(customConfigOptions = {}, configId) {
        const config = Object.assign(Object.assign({}, this.config), customConfigOptions);
        const namespace = baseWithConfig(config, configId);
        new IATopLevel(config, namespace);
        return new IATopLevel(config, namespace);
    }
    stackChannels(inputs) {
        return this.internals.ChannelStacker.fromInputs(inputs);
    }
    generate(fn, timeMeasure = TimeMeasure.SECONDS) {
        if (isFunction(fn)) {
            return new this.internals.TimeVaryingSignal(fn, timeMeasure);
        }
        else {
            throw new Error("not supported yet.");
        }
    }
    combine(inputs, fn, options = {}) {
        const values = inputs instanceof Array ? inputs : Object.values(inputs);
        // TODO: Also allow cases where the arguments aren't outputs, but values 
        // themselves.
        if (values.every(o => o.isControlStream)) {
            // Needs to learn to handle float input I think.
            return new this.internals.FunctionComponent(fn).withInputs(inputs);
        }
        else {
            return new this.internals.AudioTransformComponent(fn, Object.assign(Object.assign({}, options), { inputSpec: new StreamSpec({ numStreams: values.length }) })).withInputs(...values);
        }
    }
    // TODO: make this work for inputs/outputs
    bundle(inputs) {
        return new this.internals.BundleComponent(inputs);
    }
    // TODO: Potentially turn this into a component (?).
    ramp(units) {
        return new this.internals.AudioRateOutput('time', defineTimeRamp(this.config.audioContext, units));
    }
    read(fname) {
        return loadFile(this.config.audioContext, fname);
    }
    bufferReader(arg) {
        const bufferComponent = new BufferComponent();
        const buffer = isType(arg, String) ? this.read(arg) : arg;
        bufferComponent.buffer.setValue(buffer);
        return bufferComponent;
    }
    bufferWriter(buffer) {
        return new this.internals.BufferWriterComponent(buffer);
    }
    recorder(sources) {
        sources = sources instanceof Array ? sources : [sources];
        const component = new this.internals.AudioRecordingComponent(sources.length);
        sources.map((s, i) => s.connect(component.inputs[i]));
        return component;
    }
    /**
     * Allow joining ("mixing") across multiple audioContexts / threads.
     */
    join(sources) {
        const sourceContexts = [...new Set(sources.map(s => s.audioContext))];
        const { sinks, source } = joinContexts(sourceContexts, this.config.audioContext);
        const sinkMap = new Map(zip(sourceContexts, sinks));
        for (const sourceConnectable of sources) {
            const sink = sinkMap.get(sourceConnectable.audioContext);
            if (sink == undefined) {
                throw new Error(`Unable to find audioContext of ${sourceConnectable}.`);
            }
            sourceConnectable.connect(sink);
        }
        return new this.internals.AudioComponent(source);
    }
    createThread(_a = {}) {
        var { name, audioContext } = _a, options = __rest(_a, ["name", "audioContext"]);
        return this.withConfig(Object.assign({ audioContext: audioContext !== null && audioContext !== void 0 ? audioContext : new AudioContext() }, options), name);
    }
}

var main = new IATopLevel(defaultConfig, internals);

export { main as default };
