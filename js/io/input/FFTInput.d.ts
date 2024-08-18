import { Component } from "../../components/base/Component.js";
import { AudioRateInput } from "./AudioRateInput.js";
import { CompoundInput } from "./CompoundInput.js";
export declare class FFTInput extends CompoundInput<{
    magnitude: AudioRateInput;
    phase: AudioRateInput;
    sync: AudioRateInput;
}> {
    name: string | number;
    parent: Component;
    magnitude: AudioRateInput;
    phase: AudioRateInput;
    sync: AudioRateInput;
    constructor(name: string | number, parent: Component, magnitude: AudioRateInput, phase: AudioRateInput, sync: AudioRateInput);
}
