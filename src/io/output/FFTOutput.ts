import { Component } from "../../components/base/Component.js";
import { AudioSignalStream } from "../../shared/AudioSignalStream.js";
import { FFTStream } from "../../shared/FFTStream.js";
import { AudioRateOutput } from "./AudioRateOutput.js";
import { CompoundOutput } from "./CompoundOutput.js";

export class FFTOutput extends CompoundOutput<{
  magnitude: AudioRateOutput,
  phase: AudioRateOutput,
  sync: AudioRateOutput
}> implements FFTStream {
  magnitude: AudioRateOutput
  phase: AudioRateOutput
  sync: AudioRateOutput
  // TODO: add fftSize, etc.
  constructor(
    public name: string | number,
    magnitude: AudioRateOutput,
    phase: AudioRateOutput,
    sync: AudioRateOutput,
    public parent?: Component,
    public fftSize: number = 128
  ) {
    super(name, { magnitude, phase, sync }, parent)
  }
  ifft(): AudioSignalStream {
    const component = new this._.IFFTComponent(this.fftSize)
    this.connect(component.fftIn)
    return component
  }
}