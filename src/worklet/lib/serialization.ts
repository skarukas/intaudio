
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
  windowSize: number,
  tracebackString: string
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
  const traceback = {}
  Error.captureStackTrace(traceback)
  return {
    fnString: f.toString(),
    dimension,
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
    windowSize,
    tracebackString: traceback['stack']
  }
}

export function deserializeWorkletMessage(
  message: SerializedWorkletMessage,
  sampleRate: number,
  getCurrentTime: () => number,
  getFrameIndex: () => number
): Function {
  const originalTraceback = message.tracebackString
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
    try {
      // Apply across dimensions.
      applyToChunk(innerFunction, inputs, outputs[0], contextFactory)
    } catch (e) {
      console.error(`Encountered worklet error while processing the following input frame:`)
      console.error(inputs)
      if (e.stack) {
        e.stack = `${e.stack}\n\nMain thread stack trace: ${originalTraceback}`
      }
      throw e
    }
  }
}