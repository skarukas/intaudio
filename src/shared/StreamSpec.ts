import { sum } from "../worklet/lib/utils.js";
import constants from "./constants.js";
import { range } from "./util.js";

/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
export class StreamSpec {
  hasNumberedNames: boolean
  hasDefaultNumChannels: boolean
  names: (string | number)[]
  numStreams: number
  numChannelsPerStream: number[]

  get totalNumChannels(): number {
    return sum(Object.values(this.numChannelsPerStream))
  }
  constructor({
    names,
    numStreams,
    numChannelsPerStream
  }: {
    names?: (string | number)[],
    numStreams?: number,
    numChannelsPerStream?: number[],
  }) {
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

    // These will all be defined at this point.
    this.names = names
    this.numStreams = numStreams
    this.numChannelsPerStream = numChannelsPerStream
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