import { audio, IODatatype } from "../worklet/lib/FrameToSignatureConverter.js";
import { sum } from "../worklet/lib/utils.js";
import constants from "./constants.js";
import { isType, range } from "./util.js";

type IterableArray<T> = ArrayLike<T> & Iterable<T>

abstract class ArrayFunctionality<T> implements IterableArray<T> {
  readonly [n: number]: T;
  constructor(public length: number) {
    for (const i of range(length)) {
      Object.defineProperty(this, i, {
        get() {
          return this.getItem(i)
        }
      })
    }
  }
  *[Symbol.iterator](): Iterator<T, any, undefined> {
    for (const i of range(this.length)) {
      yield this[i]
    }
  }
  protected abstract getItem(i: number): T
}

/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
export class TypedStreamSpec extends ArrayFunctionality<{ name: string | number, type: IODatatype, numChannels?: number }> {
  hasNumberedNames: boolean
  hasDefaultNumChannels: boolean
  names: (string | number)[]
  numChannelsPerStream: number[]
  types: IODatatype[]

  constructor({
    names,
    numStreams,
    numChannelsPerStream,
    types
  }: {
    names?: (string | number)[],
    numStreams?: number,
    numChannelsPerStream?: number[],
    types?: (IODatatype | string)[]
  }) {
    super(
      numStreams
      ?? types?.length
      ?? names?.length
      ?? numChannelsPerStream?.length
      ?? 0
    )
    types && (numStreams ??= types.length)
    if (
      names != undefined
      && numStreams != undefined
      && numStreams != names.length
      || numChannelsPerStream != undefined
      && numStreams != undefined
      && numStreams != numChannelsPerStream.length
      || numChannelsPerStream instanceof Array
      && names != undefined
      && numChannelsPerStream.length != names.length
    ) {
      throw new Error(`If provided, numStreams, inputNames, and numChannelsPerStream must match. Given numStreams=${numStreams}, inputNames=${JSON.stringify(names)}, numChannelsPerStream=${numChannelsPerStream}.`)
    }
    // Store whether the names were auto-generated.
    this.hasNumberedNames = names == undefined
    this.hasDefaultNumChannels = numChannelsPerStream == undefined
    if (numChannelsPerStream != undefined) {
      const info = this.infoFromChannelsPerStream(numChannelsPerStream)
      numStreams ??= info.numStreams
      names ??= info.names
    } else if (names != undefined) {
      const info = this.infoFromNames(names)
      numStreams ??= info.numStreams
      numChannelsPerStream ??= info.numChannelsPerStream
    } else if (numStreams != undefined) {
      const info = this.infoFromNumStreams(numStreams)
      numChannelsPerStream ??= info.numChannelsPerStream
      names ??= info.names
    } else {
      throw new Error("At least one of (names, numStreams, numChannelsPerStream) must be specified.")
    }

    types ??= names.map(_ => new audio())
    // These will all be defined at this point.
    this.names = names
    this.length = numStreams
    this.numChannelsPerStream = numChannelsPerStream
    this.types = types.map(
      (v, i) => isType(v, IODatatype as any) ?
        v as IODatatype
        : IODatatype.create(<any>v, this.names[i])
    )
  }

  static fromSerialized(streamSpec: TypedStreamSpec): TypedStreamSpec {
    const types = streamSpec.types.map(t => t.name)
    return new TypedStreamSpec({ ...streamSpec, types })
  }

  protected override getItem(
    i: number
  ): { name: string | number; numChannels: number, type: IODatatype } {
    return {
      name: this.names[i],
      numChannels: this.numChannelsPerStream[i],
      type: this.types[i]
    }
  }

  get totalNumChannels(): number {
    return sum(Object.values(this.numChannelsPerStream))
  }

  protected infoFromNames(
    names: (string | number)[]
  ): { numChannelsPerStream: number[], numStreams: number } {
    return {
      numStreams: names.length,
      numChannelsPerStream: range(names.length).fill(constants.DEFAULT_NUM_CHANNELS)
    }
  }
  protected infoFromNumStreams(
    numStreams: number
  ): { numChannelsPerStream: number[], names: (string | number)[] } {
    return {
      numChannelsPerStream: range(numStreams).fill(constants.DEFAULT_NUM_CHANNELS),
      names: range(numStreams)
    }
  }
  protected infoFromChannelsPerStream(
    numChannelsPerStream: number[]
  ): { numStreams: number, names: (string | number)[] } {
    return {
      names: range(numChannelsPerStream.length),
      numStreams: numChannelsPerStream.length
    }
  }
}

// Audio-only StreamSpec
export class StreamSpec extends TypedStreamSpec implements ArrayFunctionality<{ name: string | number, numChannels?: number, type?: IODatatype }> {
  constructor({
    names,
    numStreams,
    numChannelsPerStream
  }: {
    names?: (string | number)[],
    numStreams?: number,
    numChannelsPerStream?: number[]
  }) {
    super({ names, numStreams, numChannelsPerStream })
  }
}