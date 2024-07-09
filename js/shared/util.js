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
export function createScriptProcessorNode(context, windowSize, numInputChannels, numOutputChannels) {
    const processor = context.createScriptProcessor(windowSize, numInputChannels, numOutputChannels);
    // Store true values because the constructor settings are not persisted on 
    // the WebAudio object.
    processor['__numInputChannels'] = numInputChannels;
    processor['__numOutputChannels'] = numOutputChannels;
    return processor;
}
export function range(n) {
    return Array(n).fill(0).map((v, i) => i);
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
    let timeRamp = node !== null && node !== void 0 ? node : createConstantSource(audioContext);
    let currTime = audioContext.currentTime;
    const endTime = currTime + durationSec;
    timeRamp.offset.cancelScheduledValues(currTime);
    timeRamp.offset.setValueAtTime(mapFn(0), currTime);
    timeRamp.offset.linearRampToValueAtTime(mapFn(durationSec), endTime);
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
