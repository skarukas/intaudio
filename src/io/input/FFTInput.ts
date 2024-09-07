import { Component } from "../../components/base/Component.js";
import { AudioRateInput } from "./AudioRateInput.js";
import { CompoundInput } from "./CompoundInput.js";

// TODO: remove.
// Could this be generalized to a "compound input", of which this is just a 
// subclass?
export class FFTInput extends CompoundInput<{
  magnitude: AudioRateInput,
  phase: AudioRateInput,
  sync: AudioRateInput
}> {
  magnitude!: AudioRateInput
  phase!: AudioRateInput
  sync!: AudioRateInput
  // TODO: add fftSize etc.
  constructor(
    public name: string | number,
    public parent: Component,
    magnitude: AudioRateInput,
    phase: AudioRateInput,
    sync: AudioRateInput
  ) {
    super(name, parent, { magnitude, phase, sync })
  }
}