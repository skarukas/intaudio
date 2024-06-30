import { HybridInput } from "../io/input/HybridInput.js"
import { HybridOutput } from "../io/output/HybridOutput.js"
import { Connectable } from "../shared/base/Connectable.js"
import { BaseComponent } from "./base/BaseComponent.js"
import constants from "../shared/constants.js"
import { createConstantSource } from "../shared/util.js"
import describeFunction from 'function-descriptor'

export class FunctionComponent extends BaseComponent {
  output: HybridOutput

  protected _orderedFunctionInputs: Array<HybridInput<any>> = []
  protected _audioProcessor: ScriptProcessorNode
  protected channelMerger: ChannelMergerNode

  constructor(public fn: Function) {
    super()
    const descriptor = describeFunction(fn)
    const parameters = descriptor.parameters

    // TODO: This assumes each input is mono. This should not be a requirement.
    let numChannelsPerInput = 1 // TODO: Have a way of getting this info
    this._audioProcessor = this._createScriptProcessor(descriptor.maxArgs, numChannelsPerInput)
    for (let i = 0; i < parameters.length; i++) {
      const arg = parameters[i]
      const inputName = "$" + arg.name
      const isRequired = !arg.hasDefault
      if (arg.destructureType == "rest") {
        // Can't use it or anything after it
        break
      } else if (arg.destructureType) {
        throw new Error(`Invalid function for FunctionComponent. Parameters cannot use array or object destructuring. Given: ${arg.rawName}`)
      }


      //
      const passThroughInput = createConstantSource(this.audioContext)
      this[inputName] = this._defineHybridInput(inputName, passThroughInput.offset, constants.UNSET_VALUE, isRequired)
      for (let c = 0; c < numChannelsPerInput; c++) {
        const fromChannel = c
        const toChannel = numChannelsPerInput * i + c
        passThroughInput.connect(this.channelMerger, fromChannel, toChannel)
      }
      //

      // this[inputName] = this._defineHybridInput(inputName, this._audioProcessor, _UNSET_VALUE, isRequired)
      this._orderedFunctionInputs.push(this[inputName])
    }
    let requiredArgs = parameters.filter(a => !a.hasDefault)
    if (requiredArgs.length == 1) {
      this._setDefaultInput(this["$" + requiredArgs[0].name])
    }
    this.output = this._defineHybridOutput('output', this._audioProcessor)
    this._preventIOOverwrites()
  }
  _createScriptProcessor(numInputs, numChannelsPerInput) {
    const bufferSize = undefined  // 256
    let numInputChannels = (numChannelsPerInput * numInputs) || 1
    this.channelMerger = this.audioContext.createChannelMerger(numInputChannels)
    let processor = this.audioContext.createScriptProcessor(bufferSize, numInputChannels, numChannelsPerInput)
    this.channelMerger.connect(processor)

    function _getTrueChannels(buffer) {
      // Returns an array of length numChannelsPerInput, and the i'th entry
      // contains the i'th channel for each input.
      let inputsGroupedByChannel = []
      for (let c = 0; c < numChannelsPerInput; c++) {
        let channelData = []
        for (let i = 0; i < numInputs; i++) {
          channelData.push(buffer.getChannelData(c * numChannelsPerInput + i))
        }
        inputsGroupedByChannel.push(channelData)
      }
      return inputsGroupedByChannel
    }
    const handler = e => {
      // Apply the function for each sample in each channel.
      const inputChannels = _getTrueChannels(e.inputBuffer)
      let outputChannels = []
      for (let c = 0; c < numChannelsPerInput; c++) {
        outputChannels.push(e.outputBuffer.getChannelData(c))
      }
      try {
        this.#parallelApplyAcrossChannels(inputChannels, outputChannels)
      } catch (e) {
        processor.removeEventListener('audioprocess', handler)
        throw e
      }
    }
    processor.addEventListener('audioprocess', handler)
    return processor
  }
  #parallelApplyAcrossChannels(inputChannels, outputChannels) {
    for (let c = 0; c < inputChannels.length; c++) {
      let outputChannel = outputChannels[c]
      const inputChannel = inputChannels[c]
      for (let i = 0; i < outputChannel.length; i++) {
        // For the current sample and channel, apply the function across the
        // inputs.
        const inputs = inputChannel.map(inp => inp[i])
        const res = this.fn(...inputs)
        if (typeof res != 'number') {
          throw new Error("FunctionComponents that operate on audio-rate inputs must return numbers. Given: " + (typeof res))
        }
        outputChannel[i] = res
      }
    }
  }
  inputDidUpdate<T>(input: HybridInput<T>, newValue: T) {
    const args = this._orderedFunctionInputs.map(eachInput => eachInput.value)
    const result = this.fn(...args)
    this.output.setValue(result)
  }
  process(event) {
    return this.fn(event)
  }
  call(...inputs: Array<Connectable>) {
    if (inputs.length > this._orderedFunctionInputs.length) {
      throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`)
    }
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].connect(this._orderedFunctionInputs[i])
    }
    return this
  }
}