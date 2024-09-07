import { TypedConfigurable } from "./config.js"
import constants from "./constants.js"
import { Constructor, ObjectOf, TimeMeasure } from "./types.js"

export function tryWithFailureMessage<T = any>(fn: () => T, message: string): T {
  try {
    return fn()
  } catch (e: any) {
    e.message = `${message}\nOriginal error: [${e.message}]`
    throw e
  }
}

export function isPlainObject(value: unknown) {
  return value?.constructor === Object
}

export function createScriptProcessorNode(context: AudioContext, windowSize: number, numInputChannels: number, numOutputChannels: number) {
  const processor = context.createScriptProcessor(
    windowSize,
    numInputChannels,
    numOutputChannels
  )
  // Store true values because the constructor settings are not persisted on 
  // the WebAudio object.
  // @ts-ignore Property undefined.
  processor['__numInputChannels'] = numInputChannels
  // @ts-ignore Property undefined.
  processor['__numOutputChannels'] = numOutputChannels

  return processor
}

export function range(n: number): number[] {
  return Array(n).fill(0).map((v, i) => i)
}

export function* enumerate<T>(arr: Iterable<T>): Generator<[number, T]> {
  let i = 0
  for (const x of arr) {
    yield [i++, x]
  }
}

type ZipType<T> = { [K in keyof T]: T[K] extends Iterable<infer V> ? V : never }

export function* zip<T extends Iterable<unknown>[]>(...iterables: T): Generator<ZipType<T>> {
  const iterators = iterables.map(iterable => iterable[Symbol.iterator]());
  let done = false;
  while (!done) {
    const current = iterators.map(iterator => iterator.next());
    done = current.some(result => result.done);
    if (!done) {
      yield current.map(result => result.value) as ZipType<T>
    }
  }
}

export function arrayToObject<T = any>(arr: T[]): ObjectOf<T> {
  const res: ObjectOf<T> = {}
  for (const [i, v] of enumerate(arr)) {
    res[i] = v
  }
  return res
}

export function createConstantSource(audioContext: AudioContext): ConstantSourceNode {
  let src = audioContext.createConstantSource()
  src.offset.setValueAtTime(0, audioContext.currentTime)
  src.start()
  return src
}

export function isComponent(x: any): boolean {
  return !!x?.isComponent
}

export function isFunction(x: any): boolean {
  return x instanceof Function && !(x instanceof TypedConfigurable)
}

export function mapLikeToObject(map: any) {
  const obj: any = {}
  map.forEach((v: any, k: any) => obj[k] = v)
  return obj
}

/**
 * Scale a value to a new range.
 * 
 * @param v The value to scale, where `inMin <= v <= inMax`.
 * @param inputRange An array `[inMin, inMax]` specifying the range the input comes from.
 * @param outputRange An array `[outMin, outMax]` specifying the desired range  of the output.
 * @returns A scaled value `x: outMin <= x <= outMax`.
 */
export function scaleRange(
  v: number,
  [inMin, inMax]: number[],
  [outMin, outMax]: number[]
): number {
  const zeroOneScaled = (v - inMin) / (inMax - inMin)
  return zeroOneScaled * (outMax - outMin) + outMin
}

export function afterRender(fn: Function) {
  setTimeout(fn, 100)
}

const primitiveClasses: Constructor[] = [Number, Boolean, String, Symbol, BigInt]

export function isAlwaysAllowedDatatype(value: any) {
  return value == constants.TRIGGER || value == undefined
}

export function wrapValidator(fn: (v: any) => boolean | void): (v: any) => void {
  return function (v: any) {
    if (!isAlwaysAllowedDatatype(v) && fn(v) === false) {
      throw new Error(`The value ${v} failed validation.`)
    }
  }
}

export function isType(
  x: any,
  types: ((new (...args: any[]) => any) | string)[]
): boolean
export function isType<T>(
  x: any,
  type: (new (...args: any[]) => T) | string
): x is T
export function isType<T>(
  x: any,
  types: any
) {
  types = types instanceof Array ? types : [types]
  let res = false
  for (let type of types) {
    if (primitiveClasses.includes(<Constructor>type)) {
      type = (<Constructor>type).name.toLowerCase()
    }
    if (typeof type === 'string') {
      res ||= (typeof x == type)
    } else {
      res ||= (x instanceof type)
    }
  }
  return res
}

export function createTypeValidator(type: Constructor | string): (v: any) => void {
  return function (value: any) {
    if (!isType(value, <any>type)) {
      throw new Error(`Expected value to be typeof / instanceof '${type}', but found type '${typeof value}' instead. Value: ${value}`)
    }
  }
}

export function defineTimeRamp(
  audioContext: AudioContext,
  timeMeasure: TimeMeasure,
  node: ConstantSourceNode | undefined = undefined,
  mapFn: (v: number) => number = v => v,
  durationSec: number = 1e8,
) {
  // Continuous ramp representing the AudioContext time.
  let multiplier: number
  if (timeMeasure == TimeMeasure.CYCLES) {
    multiplier = 2 * Math.PI
  } else if (timeMeasure == TimeMeasure.SECONDS) {
    multiplier = 1
  } else if (timeMeasure == TimeMeasure.SAMPLES) {
    multiplier = audioContext.sampleRate
  }
  const toValue = (v: number) => mapFn(v * multiplier)
  let timeRamp = node ?? createConstantSource(audioContext)
  let currTime = audioContext.currentTime
  const endTime = currTime + durationSec
  timeRamp.offset.cancelScheduledValues(currTime)
  timeRamp.offset.setValueAtTime(toValue(0), currTime)
  timeRamp.offset.linearRampToValueAtTime(toValue(durationSec), endTime)
  return timeRamp
}

export async function loadFile(audioContext: AudioContext, filePathOrUrl: string): Promise<AudioBuffer> {
  const response = await fetch(filePathOrUrl)
  const arrayBuffer = await response.arrayBuffer()
  return audioContext.decodeAudioData(arrayBuffer)
}

const registryIdPropname = "__registryId__"

export function getBufferId(buffer: AudioBuffer): string {
  // @ts-ignore Property undefined.
  if (!buffer[registryIdPropname]) {
    // @ts-ignore Property undefined.
    buffer[registryIdPropname] = crypto.randomUUID()
  }
  // @ts-ignore Property undefined.
  return buffer[registryIdPropname]
}

export function bufferToFloat32Arrays(buffer: AudioBuffer): Float32Array[] {
  const arrs: Float32Array[] = []
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    arrs.push(buffer.getChannelData(c))
  }
  return arrs
}

// These functions are unused as SharedArrayBuffer has is restricted to serving
// the page with certain headers. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
// TODO: consider revisitng using SharedArrayBuffer to share the buffer between 
// threads instead of copying.

/* Turns the underlying data into a shared buffer, if it is not already. */
export function makeBufferShared(arr: Float32Array): Float32Array {
  if (arr.buffer instanceof SharedArrayBuffer) {
    return arr
  }
  const sharedBuffer = new SharedArrayBuffer(arr.buffer.byteLength);
  const sharedArray = new Float32Array(sharedBuffer)
  sharedArray.set(arr);
  return sharedArray
}

export function makeAudioBufferShared(buffer: AudioBuffer) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const original = buffer.getChannelData(c)
    buffer.copyToChannel(makeBufferShared(original), c)
  }
}