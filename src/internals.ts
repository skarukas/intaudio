import { AudioRateInput } from './io/input/AudioRateInput.js';
import { ControlOutput } from './io/output/ControlOutput.js';

export { default as constants } from "./shared/constants.js"
export * as events from './shared/events.js';
export * as util from './shared/util.js';
export * from './components/ADSR.js';
export * from './components/AudioComponent.js';
export * from './components/AudioTransformComponent.js'
export * from './components/AudioRateSignalSampler.js'
export * from './components/Bang.js'
export * from './components/base/BaseComponent.js';
export * from './components/base/VisualComponent.js'
export * from './components/ChannelSplitter.js'
export * from './components/ChannelStacker.js'
export * from './components/FunctionComponent.js';
export * from './components/IgnoreDuplicates.js';
export * from './components/Keyboard.js'
export * from './components/MediaElementComponent.js'
export * from './components/MidiInputDevice.js'
export * from './components/RangeInputComponent.js'
export * from './components/ScrollingAudioMonitor.js'
export * from './components/SimplePolyphonicSynth.js'
export * from './components/SlowDown.js'
export * from './components/TimeVaryingSignal.js'
export * from './components/TypingKeyboardMidi.js'
export * from './components/Wave.js'
export * from './io/input/AbstractInput.js'
export * from './io/input/AudioRateInput.js';
export * from './io/input/ComponentInput.js'
export * from './io/input/ComponentInput.js'
export * from './io/input/ControlInput.js';
export * from './io/input/HybridInput.js'
export * from './io/output/AbstractOutput.js'
export * from './io/output/AudioRateOutput.js';
export * from './io/output/ControlOutput.js';
export * from './io/output/HybridOutput.js'
export * from './shared/base/BaseConnectable.js';
export * from './shared/base/ToStringAndUUID.js';
export * from './shared/config.js';
export * from './shared/MidiListener.js';
export * from './shared/MidiLearn.js';
export * from './shared/multichannel.js';
export * from './shared/events.js';
export * from './shared/types.js';
export * from './ui/BangDisplay.js'
export * from './ui/BaseDisplay.js'
export * from './ui/KeyboardDisplay.js'
export * from './ui/RangeInputDisplay.js'
export * from './ui/ScrollingAudioMonitorDisplay.js'


// TODO: transform constructors and some functions to take in objects instead 
// of a list of parameters (can't specify named parameters)

// TODO: is this old code? Or maybe we should actually expose these functions.
export class AudioParamControlOutput extends ControlOutput<any> {
  connections
  connect(destination) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      this.connections.push(destination)
    } else {
      throw new Error("The output must be an audio-rate input.")
    }
    return destination
  }
  #map(fn, args) {
    for (let connection of this.connections) {
      connection[fn](...args)
    }
  }
  cancelAndHoldAtTime(cancelTime) {
    this.#map('cancelAndHoldAtTime', arguments)
  }
  cancelScheduledValues(cancelTime) {
    this.#map('cancelScheduledValues', arguments)
  }
  exponentialRampToValueAtTime(value, endTime) {
    this.#map('exponentialRampToValueAtTime', arguments)
  }
  linearRampToValueAtTime(value, endTime) {
    this.#map('linearRampToValueAtTime', arguments)
  }
  setTargetAtTime(value, startTime, timeConstant) {
    this.#map('setTargetAtTime', arguments)
  }
  setValueAtTime(value, startTime) {
    this.#map('setValueAtTime', arguments)
  }
  setValueCurveAtTime(values, startTime, duration) {
    this.#map('setValueCurveAtTime', arguments)
  }
}





/* class ADSRControl extends BaseComponent {
  constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
    this.attackDurationMs = this._defineControlInput('attackDurationMs', attackDurationMs)
    this.decayDurationMs = this._defineControlInput('decayDurationMs', decayDurationMs)
    this.sustainAmplitude = this._defineControlInput('sustainAmplitude', sustainAmplitude)
    this.releaseDurationMs = this._defineControlInput('releaseDurationMs', releaseDurationMs)
  }
} */