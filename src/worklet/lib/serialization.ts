
/* Serialization */

import { StreamSpec, TypedStreamSpec } from "../../shared/StreamSpec.js"
import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js"
import { AudioDimension } from "./types.js"
import { getProcessingFunction } from "./utils.js"

export type SerializedWorkletMessage = {
  fnString: string,
  dimension: AudioDimension,
  inputSpec: StreamSpec,
  outputSpec: StreamSpec,
  windowSize: number,
  tracebackString: string
}

export function serializeWorkletMessage(
  f: Function,
  {
    dimension,
    inputSpec,
    outputSpec,
    windowSize
  }: {
    dimension: AudioDimension,
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
    windowSize: number
  }
): SerializedWorkletMessage {
  const traceback = {}
  Error.captureStackTrace(traceback)
  return {
    fnString: f.toString(),
    dimension,
    inputSpec,
    outputSpec,
    windowSize,
    // @ts-ignore
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
    // These need to be rebuilt after serialization.
    inputSpec: TypedStreamSpec.fromSerialized(message.inputSpec),
    outputSpec: TypedStreamSpec.fromSerialized(message.outputSpec),
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
      applyToChunk(innerFunction, inputs, outputs, contextFactory)
    } catch (e: any) {
      console.error(`Encountered worklet error while processing the following input frame:`)
      console.error(inputs)
      if (e.stack) {
        e.stack = `${e.stack}\n\nMain thread stack trace: ${originalTraceback}`
      }
      throw e
    }
  }
}