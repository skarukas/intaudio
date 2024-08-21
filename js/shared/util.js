var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TypedConfigurable } from "./config.js";
import constants from "./constants.js";
import { TimeMeasure } from "./types.js";
export function tryWithFailureMessage(fn, message) {
    try {
        return fn();
    }
    catch (e) {
        e.message = `${message}\nOriginal error: [${e.message}]`;
        throw e;
    }
}
export function isPlainObject(value) {
    return (value === null || value === void 0 ? void 0 : value.constructor) === Object;
}
export function createScriptProcessorNode(context, windowSize, numInputChannels, numOutputChannels) {
    const processor = context.createScriptProcessor(windowSize, numInputChannels, numOutputChannels);
    // Store true values because the constructor settings are not persisted on 
    // the WebAudio object.
    // @ts-ignore Property undefined.
    processor['__numInputChannels'] = numInputChannels;
    // @ts-ignore Property undefined.
    processor['__numOutputChannels'] = numOutputChannels;
    return processor;
}
export function range(n) {
    return Array(n).fill(0).map((v, i) => i);
}
export function* enumerate(arr) {
    let i = 0;
    for (const x of arr) {
        yield [i++, x];
    }
}
export function* zip(...iterables) {
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
export function arrayToObject(arr) {
    const res = {};
    for (const [i, v] of enumerate(arr)) {
        res[i] = v;
    }
    return res;
}
export function createConstantSource(audioContext) {
    let src = audioContext.createConstantSource();
    src.offset.setValueAtTime(0, audioContext.currentTime);
    src.start();
    return src;
}
export function isComponent(x) {
    return !!(x === null || x === void 0 ? void 0 : x.isComponent);
}
export function isFunction(x) {
    return x instanceof Function && !(x instanceof TypedConfigurable);
}
export function mapLikeToObject(map) {
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
export function scaleRange(v, [inMin, inMax], [outMin, outMax]) {
    const zeroOneScaled = (v - inMin) / (inMax - inMin);
    return zeroOneScaled * (outMax - outMin) + outMin;
}
export function afterRender(fn) {
    setTimeout(fn, 100);
}
const primitiveClasses = [Number, Boolean, String, Symbol, BigInt];
export function isAlwaysAllowedDatatype(value) {
    return value == constants.TRIGGER || value == undefined;
}
export function wrapValidator(fn) {
    return function (v) {
        if (!isAlwaysAllowedDatatype(v) && fn(v) === false) {
            throw new Error(`The value ${v} failed validation.`);
        }
    };
}
export function isType(x, types) {
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
export function createTypeValidator(type) {
    return function (value) {
        if (!isType(value, type)) {
            throw new Error(`Expected value to be typeof / instanceof '${type}', but found type '${typeof value}' instead. Value: ${value}`);
        }
    };
}
export function defineTimeRamp(audioContext, timeMeasure, node = undefined, mapFn = v => v, durationSec = 1e8) {
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
export function loadFile(audioContext, filePathOrUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(filePathOrUrl);
        const arrayBuffer = yield response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    });
}
const registryIdPropname = "__registryId__";
export function getBufferId(buffer) {
    // @ts-ignore Property undefined.
    if (!buffer[registryIdPropname]) {
        // @ts-ignore Property undefined.
        buffer[registryIdPropname] = crypto.randomUUID();
    }
    // @ts-ignore Property undefined.
    return buffer[registryIdPropname];
}
export function bufferToFloat32Arrays(buffer) {
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
export function makeBufferShared(arr) {
    if (arr.buffer instanceof SharedArrayBuffer) {
        return arr;
    }
    const sharedBuffer = new SharedArrayBuffer(arr.buffer.byteLength);
    const sharedArray = new Float32Array(sharedBuffer);
    sharedArray.set(arr);
    return sharedArray;
}
export function makeAudioBufferShared(buffer) {
    for (let c = 0; c < buffer.numberOfChannels; c++) {
        const original = buffer.getChannelData(c);
        buffer.copyToChannel(makeBufferShared(original), c);
    }
}
