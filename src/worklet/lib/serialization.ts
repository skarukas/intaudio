
/* Serialization */

import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js"
import { AudioDimension } from "./types.js"
import { getProcessingFunction } from "./utils.js"

export type SerializedWorkletMessage = {
  fnString: string,
  dimension: AudioDimension,
  numInputs: number,
  numChannelsPerInput: number,
  numOutputChannels: number,
  windowSize: number
}

export function serializeWorkletMessage(
  f: Function,
  {
    dimension,
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
    windowSize
  }
): SerializedWorkletMessage {
  return {
    fnString: f.toString(),
    dimension,
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
    windowSize
  }
}

export function deserializeWorkletMessage(
  message: SerializedWorkletMessage,
  sampleRate: number,
  getCurrentTime: () => number,
  getFrameIndex: () => number
): Function {
  const innerFunction = new Function('return ' + message.fnString)()
  const applyToChunk = getProcessingFunction(message.dimension)
  const contextFactory = new SignalProcessingContextFactory({
    ...message,
    // Each environment may get this information from different places.
    sampleRate,
    getCurrentTime,
    getFrameIndex,
  })
  return function processFn(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    __parameters: any
  ) {
    // Apply across dimensions.
    applyToChunk(innerFunction, inputs, outputs[0], contextFactory)
  }
}