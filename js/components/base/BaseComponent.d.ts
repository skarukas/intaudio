import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import constants from "../../shared/constants.js";
import { WebAudioConnectable, CanBeConnectedTo, ObjectOf, KeysLike, AnyInput, AnyOutput } from "../../shared/types.js";
import { Component } from "./Component.js";
import { Connectable } from "../../shared/base/Connectable.js";
import { AudioSignalStream } from "../../shared/AudioSignalStream.js";
import { ControlOutput } from "../../io/output/ControlOutput.js";
import { AudioRateOutput } from "../../io/output/AudioRateOutput.js";
import { HybridInput } from "../../io/input/HybridInput.js";
import { HybridOutput } from "../../io/output/HybridOutput.js";
import { AudioRateInput } from "../../io/input/AudioRateInput.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { BundleComponent } from "../BundleComponent.js";
import { CompoundInput } from "../../io/input/CompoundInput.js";
import { CompoundOutput } from "../../io/output/CompoundOutput.js";
import { FFTStream } from "../../shared/FFTStream.js";
import { BypassEvent, MuteEvent } from "../../shared/events.js";
export declare abstract class BaseComponent<InputTypes extends AnyInput = AnyInput, OutputTypes extends AnyOutput = AnyOutput> extends BaseConnectable implements Component<InputTypes, OutputTypes>, AudioSignalStream {
    readonly isComponent = true;
    private static instanceExists;
    inputs: InputTypes;
    outputs: OutputTypes;
    isBypassed: ControlInput<boolean>;
    isMuted: ControlInput<boolean>;
    triggerInput: ControlInput<typeof constants.TRIGGER>;
    private _defaultInput;
    private _defaultOutput;
    private _reservedInputs;
    private _reservedOutputs;
    constructor();
    logSignal({ samplePeriodMs, format }?: {
        samplePeriodMs?: number;
        format?: string;
    }): this;
    capture(numSamples: number): Promise<AudioBuffer[]>;
    toString(): string;
    protected now(): number;
    protected validateIsSingleton(): void;
    protected preventIOOverwrites(): void;
    private freezeProperty;
    protected defineInputOrOutput<T extends AbstractOutput>(propName: string | number, inputOrOutput: T, inputsOrOutputsObject: ObjectOf<AbstractOutput>): T;
    protected defineInputOrOutput<T extends AbstractInput>(propName: string | number, inputOrOutput: T, inputsOrOutputsObject: ObjectOf<AbstractInput>): T;
    protected defineOutputAlias<OutputType extends AbstractOutput<any>>(name: string | number, output: OutputType): OutputType;
    protected defineInputAlias<InputType extends AbstractInput<any>>(name: string | number, input: InputType): InputType;
    protected defineControlInput<T>(name: string | number, defaultValue?: T | undefined, isRequired?: boolean): ControlInput<T>;
    protected defineCompoundInput<T extends ObjectOf<AbstractInput>>(name: string | number, inputs: T, defaultInput?: AbstractInput): CompoundInput<T>;
    protected defineAudioInput(name: string | number, destinationNode: WebAudioConnectable): AudioRateInput;
    protected defineHybridInput<T>(name: string | number, destinationNode: WebAudioConnectable, defaultValue?: T | undefined, isRequired?: boolean): HybridInput<T>;
    protected defineCompoundOutput<T extends ObjectOf<AbstractOutput>>(name: string | number, outputs: T, defaultOutput?: AbstractOutput): CompoundOutput<T>;
    protected defineControlOutput(name: string | number): ControlOutput<any>;
    protected defineAudioOutput(name: string | number, audioNode: AudioNode): AudioRateOutput;
    protected defineHybridOutput(name: string | number, audioNode: AudioNode): HybridOutput;
    protected setDefaultInput(input: AbstractInput): void;
    protected setDefaultOutput(output: AbstractOutput): void;
    getDefaultInput(): ComponentInput<any>;
    get defaultOutput(): AbstractOutput | undefined;
    get defaultInput(): ComponentInput<any>;
    protected allInputsAreDefined(): boolean;
    propagateUpdatedInput<T>(inputStream: AbstractInput<T>, newValue: T): void;
    protected outputAdded<T>(destintion: AbstractInput<T>): void;
    protected inputAdded<T>(source: AbstractOutput<T>): void;
    protected onBypassEvent(event: BypassEvent): void;
    protected onMuteEvent(event: MuteEvent): void;
    protected inputDidUpdate<T>(input: AbstractInput<T>, newValue: T): void;
    setBypassed(isBypassed?: boolean): void;
    setMuted(isMuted?: boolean): void;
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    disconnect(destination?: Component | AbstractInput): void;
    withInputs(argDict: {
        [name: string | number]: Connectable | unknown;
    }): this;
    setValues(valueObj: ObjectOf<any>): void;
    wasConnectedTo<T>(other: AbstractOutput<T>): AbstractOutput<T>;
    protected getInputsBySpecs(inputSpecs: (string | string[])[]): AbstractInput[][];
    protected getChannelsBySpecs(channelSpecs: (string | (number | string)[])[]): AbstractOutput[][];
    protected getOutputsBySpecs(outputSpecs: (string | string[])[]): AbstractOutput[][];
    /**
     * Given an array of strings specifying which inputs/outputs to select, return an array of the same length where each entry contains the inputs/outputs matched by that spec.
     *
     * Each spec is one of:
     * 1. A string representing a specific input or output name. Example: `"in1"`.
     * 2. An array of input or output names. Example: `["in1", "in2"]`.
     * 3. A stringified version of (2). Example: `"in1, in2"`.
     * 4. The string `"*"` which means to match any unspecified. This may only appear once.
     *
     * NOTE: Any spaces will be removed, so `"in1,in2"`, `" in1 , in2 "`, and `"in1, in2"` are equivalent.
     */
    protected getBySpecs<T extends (AbstractInput | AbstractOutput)>(specs: (string | (number | string)[])[], obj: ObjectOf<T>): T[][];
    /**
     * Define a map from output name to a definition of the signal processing graph to connect it to.
     *
     * TODO: Outputs that aren't mentioned should be passed through unchanged (currenly not supported bc they aren't components).
     *
     * Ex: myComponent.perOutput({
     *   output1: o1 => o1.connect(ia.oscillator().frequency)
     * })
     */
    perOutput(functions: KeysLike<OutputTypes, (x: Connectable) => Component>): BundleComponent<any>;
    perOutput(functions: ((x: Connectable) => Component)[]): BundleComponent<any>;
    perChannel(functions: {
        left?: (x: Connectable) => Component;
        right?: (x: Connectable) => Component;
        [key: number]: (x: Connectable) => Component;
    }): Component;
    perChannel(functions: ((x: Connectable) => Component)[]): Component;
    protected getAudioOutputProperty(propName: string): any;
    /** Methods delegated to default audio input / output. **/
    get numInputChannels(): number;
    get numOutputChannels(): any;
    sampleSignal(samplePeriodMs?: number): Component;
    splitChannels(...inputChannelGroups: number[][]): Iterable<AudioRateOutput>;
    get left(): AudioRateOutput;
    get right(): AudioRateOutput;
    get channels(): MultiChannelArray<AudioRateOutput>;
    transformAudio(fn: (input: MultiChannelArray<Float32Array>) => (number[] | Float32Array)[], { windowSize, useWorklet, dimension }: {
        windowSize?: number;
        useWorklet?: boolean;
        dimension: "all";
    }): Component;
    transformAudio(fn: (input: MultiChannelArray<number>) => number[], { useWorklet, dimension }: {
        useWorklet?: boolean;
        dimension: "channels";
    }): Component;
    transformAudio(fn: (samples: Float32Array) => (Float32Array | number[]), { windowSize, useWorklet, dimension }: {
        windowSize?: number;
        useWorklet?: boolean;
        dimension: "time";
    }): Component;
    transformAudio(fn: (x: number) => number, { useWorklet, dimension }: {
        useWorklet?: boolean;
        dimension?: "none";
    }): Component;
    fft(fftSize?: number): FFTStream;
    toChannels(numChannels: number, mode?: 'speakers' | 'discrete' | 'repeat'): Component;
}
