import stache from 'stache-config';
import CallableInstance from 'callable-instance';

type AudioDimension = "all" | "none" | "channels" | "time";
type MultiChannelArray<T> = ArrayLike$1<T> & {
    get left(): T;
    get right(): T;
};
type ArrayLike$1<T> = {
    length: number;
    [idx: number]: T;
};
type SignalProcessingFnInput<D> = (D extends "all" ? MultiChannelArray<ArrayLike$1<number>> : (D extends "channels" ? MultiChannelArray<number> : (D extends "time" ? ArrayLike$1<number> : number)));

declare const _default$2: Readonly<{
    MUTED_CLASS: "component-muted";
    BYPASSED_CLASS: "component-bypassed";
    COMPONENT_CONTAINER_CLASS: "modular-container";
    KEYBOARD_KEY_CLASS: "keyboard-key";
    KEYBOARD_KEY_PRESSED_CLASS: "keyboard-key-pressed";
    BYPASS_INDICATOR_CLASS: "bypass-indicator";
    MONITOR_VALUE_CLASS: "monitor-value";
    MONITOR_OUT_OF_BOUNDS_CLASS: "monitor-out-of-bounds";
    UNINITIALIZED_CLASS: "component-uninitialized";
    BANG_CLASS: "bang";
    BANG_PRESSED_CLASS: "bang-pressed";
    MIDI_LEARN_LISTENING_CLASS: "midi-learn-listening";
    MIDI_LEARN_ASSIGNED_CLASS: "midi-learn-assigned";
    EVENT_AUDIOPROCESS: "audioprocess";
    EVENT_MOUSEDOWN: "mousedown";
    EVENT_MOUSEUP: "mouseup";
    TRIGGER: symbol;
    MIN_PLAYBACK_RATE: 0.0625;
    MAX_PLAYBACK_RATE: 16;
    MAX_CHANNELS: 32;
    DEFAULT_NUM_CHANNELS: 2;
    MAX_ANALYZER_LENGTH: 32768;
    UNSET_VALUE: undefined;
}>;

declare class BaseEvent extends ToStringAndUUID {
    #private;
    _isLocal: boolean;
    ignoreDefault(): void;
    defaultIsIgnored(): boolean;
}
declare class BypassEvent extends BaseEvent {
    shouldBypass: boolean;
    _isLocal: boolean;
    constructor(shouldBypass: boolean);
}
declare class MuteEvent extends BaseEvent {
    shouldMute: boolean;
    _isLocal: boolean;
    constructor(shouldMute: boolean);
}
declare enum KeyEventType {
    KEY_DOWN = "keydown",
    KEY_UP = "keyup"
}
declare class KeyEvent extends BaseEvent {
    eventType: KeyEventType;
    eventPitch: number;
    eventVelocity: number;
    key: any;
    constructor(eventType: KeyEventType, eventPitch?: number, eventVelocity?: number, key?: any);
}

type events_d_BaseEvent = BaseEvent;
declare const events_d_BaseEvent: typeof BaseEvent;
type events_d_BypassEvent = BypassEvent;
declare const events_d_BypassEvent: typeof BypassEvent;
type events_d_KeyEvent = KeyEvent;
declare const events_d_KeyEvent: typeof KeyEvent;
type events_d_KeyEventType = KeyEventType;
declare const events_d_KeyEventType: typeof KeyEventType;
type events_d_MuteEvent = MuteEvent;
declare const events_d_MuteEvent: typeof MuteEvent;
declare namespace events_d {
  export { events_d_BaseEvent as BaseEvent, events_d_BypassEvent as BypassEvent, events_d_KeyEvent as KeyEvent, events_d_KeyEventType as KeyEventType, events_d_MuteEvent as MuteEvent };
}

interface Connectable {
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
}

declare abstract class BaseConnectable extends ToStringAndUUID implements Connectable {
    abstract connect<T extends Component>(destination: T): T;
    abstract connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    abstract get defaultOutput(): AbstractOutput | undefined;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
    getDestinationInfo(destination: CanBeConnectedTo): {
        component: Component | undefined;
        input: AbstractInput;
    };
}

interface HasTypeValidator {
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn: (v: any) => boolean | void): this;
    ofType(type: Constructor | string): this;
}

declare abstract class AbstractOutput<T = any> extends BaseConnectable implements HasTypeValidator {
    name: string | number;
    parent?: Component | undefined;
    protected validate: (value: any) => void;
    constructor(name: string | number, parent?: Component | undefined);
    connections: AbstractInput[];
    abstract get numOutputChannels(): number;
    callbacks: Array<(val?: T) => void>;
    ofType(type: Constructor | string): this;
    toString(): string;
    get defaultOutput(): AbstractOutput | undefined;
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn: (v: any) => boolean | void): this;
}

declare class Disconnect extends Error {
}
/**
 * A special Error object that, when thrown within a FunctionComponent, will cause the component to disconnect, but not log the error.
 */
declare const disconnect: () => never;
type CanBeConnectedTo = (Component | WebAudioConnectable | AudioNode | Function | AbstractInput);
type WebAudioConnectable = AudioParam | AudioNode;
type AnyInput = {
    [name: string | number | symbol]: AbstractInput;
};
type AnyOutput = {
    [name: string | number | symbol]: AbstractOutput;
};
type ObjectOf<T> = {
    [key: number | string]: T;
};
type ObjectOrArrayOf<T> = T[] | ObjectOf<T>;
type KeysLike<T, V> = {
    [K in keyof T]: V;
};
type Bundle<T> = T & {
    [Symbol.iterator](): Iterator<T>;
};
type Constructor<T = any> = {
    new?(): T;
    name: string;
    [Symbol.hasInstance](x: T): boolean;
};
type MaybePromise<T> = T | Promise<T>;
type MaybePromises<T> = {
    [K in keyof T]: MaybePromise<T[K]>;
};
declare enum WaveType {
    SINE = "sine",
    SQUARE = "square",
    SAWTOOTH = "sawtooth",
    TRIANGLE = "triangle",
    CUSTOM = "custom"
}
declare enum RangeType {
    SLIDER = "slider",
    KNOB = "knob"
}
declare enum TimeMeasure {
    CYCLES = "cycles",
    SECONDS = "seconds",
    SAMPLES = "samples"
}
type AnyFn<T0, T1, T2, T3, T4, T5, ReturnType> = Function | (() => ReturnType) | ((a0?: T0) => ReturnType) | ((a0?: T0, a1?: T1) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5, ...args: any[]) => ReturnType);
interface MultiChannel<T extends (AbstractInput | AbstractOutput) = any> {
    get left(): T;
    get right(): T;
    channels: MultiChannelArray<T>;
    activeChannel: number | undefined;
}

declare function tryWithFailureMessage<T = any>(fn: () => T, message: string): T;
declare function isPlainObject(value: unknown): boolean;
declare function createScriptProcessorNode(context: AudioContext, windowSize: number, numInputChannels: number, numOutputChannels: number): ScriptProcessorNode;
declare function range(n: number): number[];
declare function enumerate<T>(arr: Iterable<T>): Generator<[number, T]>;
type ZipType<T> = {
    [K in keyof T]: T[K] extends Iterable<infer V> ? V : never;
};
declare function zip<T extends Iterable<unknown>[]>(...iterables: T): Generator<ZipType<T>>;
declare function arrayToObject<T = any>(arr: T[]): ObjectOf<T>;
declare function createConstantSource(audioContext: AudioContext): ConstantSourceNode;
declare function isComponent(x: any): boolean;
declare function isFunction(x: any): boolean;
declare function mapLikeToObject(map: any): any;
/**
 * Scale a value to a new range.
 *
 * @param v The value to scale, where `inMin <= v <= inMax`.
 * @param inputRange An array `[inMin, inMax]` specifying the range the input comes from.
 * @param outputRange An array `[outMin, outMax]` specifying the desired range  of the output.
 * @returns A scaled value `x: outMin <= x <= outMax`.
 */
declare function scaleRange(v: number, [inMin, inMax]: number[], [outMin, outMax]: number[]): number;
declare function afterRender(fn: Function): void;
declare function isAlwaysAllowedDatatype(value: any): boolean;
declare function wrapValidator(fn: (v: any) => boolean | void): (v: any) => void;
declare function isType(x: any, types: ((new (...args: any[]) => any) | string)[]): boolean;
declare function isType<T>(x: any, type: (new (...args: any[]) => T) | string): x is T;
declare function createTypeValidator(type: Constructor | string): (v: any) => void;
declare function defineTimeRamp(audioContext: AudioContext, timeMeasure: TimeMeasure, node?: ConstantSourceNode | undefined, mapFn?: (v: number) => number, durationSec?: number): ConstantSourceNode;
declare function loadFile(audioContext: AudioContext, filePathOrUrl: string): Promise<AudioBuffer>;
declare function getBufferId(buffer: AudioBuffer): string;
declare function bufferToFloat32Arrays(buffer: AudioBuffer): Float32Array[];
declare function makeBufferShared(arr: Float32Array): Float32Array;
declare function makeAudioBufferShared(buffer: AudioBuffer): void;

declare const util_d_afterRender: typeof afterRender;
declare const util_d_arrayToObject: typeof arrayToObject;
declare const util_d_bufferToFloat32Arrays: typeof bufferToFloat32Arrays;
declare const util_d_createConstantSource: typeof createConstantSource;
declare const util_d_createScriptProcessorNode: typeof createScriptProcessorNode;
declare const util_d_createTypeValidator: typeof createTypeValidator;
declare const util_d_defineTimeRamp: typeof defineTimeRamp;
declare const util_d_enumerate: typeof enumerate;
declare const util_d_getBufferId: typeof getBufferId;
declare const util_d_isAlwaysAllowedDatatype: typeof isAlwaysAllowedDatatype;
declare const util_d_isComponent: typeof isComponent;
declare const util_d_isFunction: typeof isFunction;
declare const util_d_isPlainObject: typeof isPlainObject;
declare const util_d_isType: typeof isType;
declare const util_d_loadFile: typeof loadFile;
declare const util_d_makeAudioBufferShared: typeof makeAudioBufferShared;
declare const util_d_makeBufferShared: typeof makeBufferShared;
declare const util_d_mapLikeToObject: typeof mapLikeToObject;
declare const util_d_range: typeof range;
declare const util_d_scaleRange: typeof scaleRange;
declare const util_d_tryWithFailureMessage: typeof tryWithFailureMessage;
declare const util_d_wrapValidator: typeof wrapValidator;
declare const util_d_zip: typeof zip;
declare namespace util_d {
  export { util_d_afterRender as afterRender, util_d_arrayToObject as arrayToObject, util_d_bufferToFloat32Arrays as bufferToFloat32Arrays, util_d_createConstantSource as createConstantSource, util_d_createScriptProcessorNode as createScriptProcessorNode, util_d_createTypeValidator as createTypeValidator, util_d_defineTimeRamp as defineTimeRamp, util_d_enumerate as enumerate, util_d_getBufferId as getBufferId, util_d_isAlwaysAllowedDatatype as isAlwaysAllowedDatatype, util_d_isComponent as isComponent, util_d_isFunction as isFunction, util_d_isPlainObject as isPlainObject, util_d_isType as isType, util_d_loadFile as loadFile, util_d_makeAudioBufferShared as makeAudioBufferShared, util_d_makeBufferShared as makeBufferShared, util_d_mapLikeToObject as mapLikeToObject, util_d_range as range, util_d_scaleRange as scaleRange, util_d_tryWithFailureMessage as tryWithFailureMessage, util_d_wrapValidator as wrapValidator, util_d_zip as zip };
}

/**
 * A decorator to allow properties to be computed once, only when needed.
 *
 * Usage:
 *
 * @example
 * class A {
 *   \@jit(Math.random)
 *   iprop1: number
 *
 *   \@jit((_, propName) => "expensive computation of " + propName))
 *   static sprop1: number
 * }
 *
 */
declare function lazyProperty(initializer: (thisObj: any, propName?: string) => any): (target: any, prop: string) => void;
/**
 * Declare that a function's parameters may be promises, and the function will perform its action once all promises are resolved and return a promise.
 */
declare function resolvePromiseArgs<I extends any[], O>(obj: any, propName: string, descriptor: PropertyDescriptor): TypedPropertyDescriptor<((...args: MaybePromises<I>) => MaybePromise<O>) | ((...args: I) => O)>;

declare class ControlInput<T> extends AbstractInput<T> {
    name: string | number;
    readonly numInputChannels: number;
    _value: T;
    constructor(name: string | number, parent: Component, defaultValue?: T, isRequired?: boolean);
    get value(): T;
    setValue(value: T | Promise<T>): void;
}

declare class AudioRateInput extends AbstractInput<number> implements MultiChannel<AudioRateInput> {
    name: string | number;
    parent: Component | undefined;
    audioSink: WebAudioConnectable;
    readonly channels: MultiChannelArray<this>;
    activeChannel: number | undefined;
    get numInputChannels(): number;
    constructor(name: string | number, parent: Component | undefined, audioSink: WebAudioConnectable);
    get left(): this;
    get right(): this;
    get value(): number;
    setValue(value: number | typeof _default$2.TRIGGER): void;
}

declare class ComponentInput<T> extends AudioRateInput {
    name: string | number;
    protected _defaultInput: AbstractInput<T> | undefined;
    get defaultInput(): AbstractInput<T> | undefined;
    constructor(name: string | number, parent: BaseComponent, defaultInput?: AbstractInput<T>);
    setValue(value: any): void;
}

interface FFTStream extends Connectable {
    ifft(fftSize?: number): AudioSignalStream;
}

interface AudioSignalStream extends Connectable {
    get numInputChannels(): number;
    get numOutputChannels(): number;
    sampleSignal(samplePeriodMs?: number): Component;
    logSignal({ samplePeriodMs, format }: {
        samplePeriodMs?: number;
        format: string;
    }): this;
    splitChannels(): Iterable<AudioSignalStream>;
    splitChannels(...inputChannelGroups: number[][]): Iterable<AudioSignalStream>;
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
    capture(numSamples: number): Promise<AudioBuffer[]>;
    fft(fftSize?: number): FFTStream;
}

declare class ControlOutput<T> extends AbstractOutput<T> {
    numOutputChannels: number;
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    setValue(value: T | Promise<T>, rawObject?: boolean): void;
    onUpdate(callback: (val?: T) => void): void;
}

declare class AudioRateOutput extends AbstractOutput<number> implements MultiChannel<AudioRateOutput>, AudioSignalStream {
    name: string | number;
    audioNode: AudioNode;
    parent?: Component | undefined;
    private _channels;
    activeChannel: undefined;
    constructor(name: string | number, audioNode: AudioNode, parent?: Component | undefined);
    get channels(): MultiChannelArray<AudioRateOutput>;
    get left(): AudioRateOutput;
    get right(): AudioRateOutput;
    get numInputChannels(): number;
    get numOutputChannels(): number;
    toString(): string;
    private connectNodes;
    connect<T extends Component>(destination: T): T;
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    sampleSignal(samplePeriodMs?: number): Component;
    logSignal({ samplePeriodMs, format }?: {
        samplePeriodMs?: number;
        format?: string;
    }): this;
    splitChannels(...inputChannelGroups: number[][]): Iterable<AudioRateOutput>;
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
    disconnect(destination: CanBeConnectedTo): void;
    /**
     * Return the current audio samples.
     */
    capture(numSamples: number): Promise<AudioBuffer[]>;
    fft(fftSize?: number): FFTStream;
}

declare class HybridInput<T> extends AbstractInput<T> implements MultiChannel<HybridInput<T>> {
    name: string | number;
    parent: Component;
    audioSink: WebAudioConnectable;
    isRequired: boolean;
    get numInputChannels(): number;
    readonly channels: MultiChannelArray<this>;
    activeChannel: number | undefined;
    private _value;
    constructor(name: string | number, parent: Component, audioSink: WebAudioConnectable, defaultValue?: T | undefined, isRequired?: boolean);
    get left(): this;
    get right(): this;
    get value(): T | undefined;
    setValue(value: T | Promise<T>): void;
}

declare class HybridOutput<T = any> extends AudioRateOutput {
    connect(destination: CanBeConnectedTo): Component<AnyInput, AnyOutput> | undefined;
    setValue(value: T | Promise<T>, rawObject?: boolean): void;
    onUpdate(callback: (val?: any) => void): void;
}

type InputTypes<T> = {
    [K in keyof T]: T[K] extends AbstractInput<infer Inner> ? Inner : unknown;
};
declare class CompoundInput<InputsDict extends ObjectOf<AbstractInput>> extends AbstractInput<InputTypes<InputsDict>> implements MultiChannel<AbstractInput> {
    name: string | number;
    parent: Component;
    protected _defaultInput: AbstractInput<any> | undefined;
    channels: MultiChannelArray<this>;
    activeChannel: number | undefined;
    inputs: InputsDict;
    get left(): AbstractInput<any>;
    get right(): AbstractInput<any>;
    get keys(): Set<string>;
    get defaultInput(): AbstractInput<any> | undefined;
    constructor(name: string | number, parent: Component, inputs: InputsDict, defaultInput?: AbstractInput);
    protected mapOverInputs<T>(fn: (i: AbstractInput, name: string | number) => T): KeysLike<InputsDict, T>;
    get numInputChannels(): number;
    get value(): InputTypes<InputsDict>;
    setValue(valueDict: InputTypes<InputsDict>): void;
    setValue(valueForDefaultInput: any): void;
}

type OutputTypes<T> = {
    [K in keyof T]: T[K] extends AbstractOutput<infer Inner> ? Inner : unknown;
};
declare class CompoundOutput<OutputsDict extends ObjectOf<AbstractOutput>> extends AbstractOutput<OutputTypes<OutputsDict>> implements MultiChannel<AbstractOutput> {
    name: string | number;
    parent?: Component | undefined;
    connect<T extends Component>(destination: T): T;
    connect<T extends CanBeConnectedTo>(destination: T): Component;
    channels: MultiChannelArray<this>;
    activeChannel: number | undefined;
    outputs: OutputsDict;
    get keys(): Set<string>;
    get left(): AbstractOutput<any>;
    get right(): AbstractOutput<any>;
    private _defaultOutput;
    get defaultOutput(): AbstractOutput | undefined;
    constructor(name: string | number, outputs: OutputsDict, parent?: Component | undefined, defaultOutput?: AbstractOutput);
    protected mapOverOutputs<T>(fn: (i: AbstractOutput, name: string | number) => T): KeysLike<OutputsDict, T>;
    get numOutputChannels(): number;
}

/**
 * Represents a group of components that can be operated on independently.
 */
declare class BundleComponent<ComponentDict extends ObjectOf<Component>> extends BaseComponent implements Component, Iterable<Component> {
    protected componentObject: ObjectOf<Component>;
    protected componentValues: Component[];
    input: CompoundInput<KeysLike<ComponentDict, AbstractInput>>;
    output: CompoundOutput<KeysLike<ComponentDict, AbstractOutput>>;
    length: number;
    constructor(components: ComponentDict | Array<Component>);
    get isControlStream(): boolean;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    [Symbol.iterator](): Iterator<Component>;
    getDefaultInput(): ComponentInput<unknown>;
    get defaultOutput(): undefined;
    get numOutputChannels(): number;
    get numInputChannels(): number;
    setBypassed(isBypassed?: boolean): void;
    setMuted(isMuted?: boolean): void;
    protected getBundledResult(fnName: string, ...inputs: any[]): BundleComponent<ObjectOf<any>>;
    connect<T extends CanBeConnectedTo>(destination: T): Component;
    withInputs(inputDict: {
        [name: string]: Connectable;
    }): this;
    setValues(valueObj: any): BundleComponent<ObjectOf<any>>;
    wasConnectedTo<T>(source: AbstractOutput<T>): AbstractOutput<T>;
    sampleSignal(samplePeriodMs?: number): Component;
    propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T): BundleComponent<ObjectOf<any>>;
}

declare abstract class BaseComponent<InputTypes extends AnyInput = AnyInput, OutputTypes extends AnyOutput = AnyOutput> extends BaseConnectable implements Component<InputTypes, OutputTypes>, AudioSignalStream {
    readonly isComponent = true;
    private static instanceExists;
    inputs: InputTypes;
    outputs: OutputTypes;
    isBypassed: ControlInput<boolean>;
    isMuted: ControlInput<boolean>;
    triggerInput: ControlInput<typeof _default$2.TRIGGER>;
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
}

type I$1 = {
    readonly attackEvent: ControlInput<typeof _default$2.TRIGGER>;
    readonly releaseEvent: ControlInput<typeof _default$2.TRIGGER>;
    readonly attackDurationMs: ControlInput<number>;
    readonly decayDurationMs: ControlInput<number>;
    readonly sustainAmplitude: ControlInput<number>;
    readonly releaseDurationMs: ControlInput<number>;
};
type O$1 = {
    readonly audioOutput: AudioRateOutput;
};
declare class ADSR extends BaseComponent<I$1, O$1> implements I$1, O$1 {
    readonly attackEvent: ControlInput<any>;
    readonly releaseEvent: ControlInput<any>;
    readonly attackDurationMs: ControlInput<number>;
    readonly decayDurationMs: ControlInput<number>;
    readonly sustainAmplitude: ControlInput<number>;
    readonly releaseDurationMs: ControlInput<number>;
    readonly audioOutput: AudioRateOutput;
    private _paramModulator;
    private state;
    constructor(attackDurationMs: number, decayDurationMs: number, sustainAmplitude: number, releaseDurationMs: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
}

declare class AudioComponent extends BaseComponent {
    readonly input: AudioRateInput;
    readonly output: AudioRateOutput | undefined;
    constructor(inputNode: WebAudioConnectable);
}

declare class AudioRecordingComponent extends BaseComponent {
    [n: number]: AudioRateInput;
    protected worklet: AudioWorkletNode;
    isRecording: boolean;
    protected onMessage: (buffers: AudioBuffer[]) => void;
    protected onFailure: () => void;
    constructor(numberOfInputs?: number);
    capture(numSamples: number): Promise<AudioBuffer[]>;
    start(): void;
    stop(): Promise<AudioBuffer[]>;
    protected waitForWorkletResponse(): Promise<AudioBuffer[]>;
    protected handleMessage(floatData: Float32Array[][]): void;
}

type RawChannelFrame<D extends AudioDimension> = {
    audioStreams: ArrayLike$1<SignalProcessingFnInput<D>>;
    parameters?: {
        [id: string]: any;
    };
};
declare abstract class IODatatype<Channel = any> {
    name: string;
    constructor();
    abstract dataspecString: string;
    abstract numAudioStreams: number;
    abstract channelFromAudioData(frame: RawChannelFrame<"channels">): Channel;
    abstract __OLD__channelToAudioData(channel: Channel): RawChannelFrame<"channels">;
    abstract __OLD__validate(channel: Channel, options?: ObjectOf<any>): void;
    abstract __NEW__validateAny(value: any): boolean;
    abstract __NEW__toAudioData<D extends AudioDimension>(value: any, sampleIndex?: number): RawChannelFrame<D>;
    toString(): string;
    static create(dtype: string, name: string | number): IODatatype;
}
/**
 * Converts a frame of audio data + metadata to and from function I/O types exposed to the user-defined function. The frame may be of any dimension.
 */
declare class FrameToSignatureConverter<D extends AudioDimension> {
    dimension: D;
    inputSpec: TypedStreamSpec;
    outputSpec: TypedStreamSpec;
    constructor(dimension: D, inputSpec: TypedStreamSpec, outputSpec: TypedStreamSpec);
    /**
     * Convert raw audio frame data into user-friendly function inputs.
     */
    prepareInputs(frame: RawChannelFrame<D>): SignalProcessingFnInput<D>[];
    normalizeOutputs(outputs: unknown): SignalProcessingFnInput<D>[];
    protected validateOutputs(outputs: unknown): string[];
    protected __OLD__validateOutputs(outputs: unknown): void;
    /**
     * Convert user output back into raw data.
     */
    processOutputs(outputs: SignalProcessingFnInput<D>[]): RawChannelFrame<D>;
    protected outputToAudioStreams(output: SignalProcessingFnInput<D>, type: IODatatype): SignalProcessingFnInput<D>[];
}

type IterableArray<T> = ArrayLike<T> & Iterable<T>;
declare abstract class ArrayFunctionality<T> implements IterableArray<T> {
    length: number;
    readonly [n: number]: T;
    constructor(length: number);
    [Symbol.iterator](): Iterator<T, any, undefined>;
    protected abstract getItem(i: number): T;
}
/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
declare class TypedStreamSpec extends ArrayFunctionality<{
    name: string | number;
    type: IODatatype;
    numChannels?: number;
}> {
    hasNumberedNames: boolean;
    hasDefaultNumChannels: boolean;
    names: (string | number)[];
    numChannelsPerStream: number[];
    types: IODatatype[];
    constructor({ names, numStreams, numChannelsPerStream, types }: {
        names?: (string | number)[];
        numStreams?: number;
        numChannelsPerStream?: number[];
        types?: (IODatatype | string)[];
    });
    static fromSerialized(streamSpec: TypedStreamSpec): TypedStreamSpec;
    protected getItem(i: number): {
        name: string | number;
        numChannels: number;
        type: IODatatype;
    };
    get totalNumChannels(): number;
    protected infoFromNames(names: (string | number)[]): {
        numChannelsPerStream: number[];
        numStreams: number;
    };
    protected infoFromNumStreams(numStreams: number): {
        numChannelsPerStream: number[];
        names: (string | number)[];
    };
    protected infoFromChannelsPerStream(numChannelsPerStream: number[]): {
        numStreams: number;
        names: (string | number)[];
    };
    toString(): string;
}
declare class StreamSpec extends TypedStreamSpec implements ArrayFunctionality<{
    name: string | number;
    numChannels?: number;
    type?: IODatatype;
}> {
    constructor({ names, numStreams, numChannelsPerStream }: {
        names?: (string | number)[];
        numStreams?: number;
        numChannelsPerStream?: number[];
    });
}

/**
 * A data structure storing the last N values in a time series.
 *
 * It is implemented as a circular array to avoid processing when the time step
 * is incremented.
 *
 * Here's a demonstration with eaach t[n] being an absolute time, | showing
 * the position of the offset, and _ being the default value.
 *
 * "Initial" state storing the first 4 values:
 * - circularBuffer: [|v3 v2 v1 v0]
 * - offset: 0
 *
 * > get(0) = v3
 * > get(1) = v2
 * > get(4) = _
 *
 * After add(v4):
 * - circularBuffer: [v3 v2 v1 | v4]
 * - offset: 3
 *
 * > get(0) = v4
 * > get(1) = v3
 *
 * After setSize(8):
 * - circularBuffer: [|v4 v3 v2 v1 _ _ _ _]
 * - offset: 0
 *
 */
declare class MemoryBuffer<T> {
    defaultValueFn: (() => T);
    protected circularBuffer: T[];
    protected offset: number;
    constructor(defaultValueFn: (() => T));
    get length(): number;
    protected toInnerIndex(i: number): number;
    /**
     * Get the ith value of the memory. Note that index 0 is the previous value, not 1.
     */
    get(i: number): T;
    /**
     * Add `val` to the array of memory, incrementing the time step. If `length` is zero, this is a no-op.
     *
     * NOTE: to add without discarding old values, always call setSize first.
     */
    add(val: T): void;
    setSize(size: number): void;
}

declare class SignalProcessingContext<D extends AudioDimension> {
    protected inputMemory: MemoryBuffer<SignalProcessingFnInput<D>[]>;
    protected outputMemory: MemoryBuffer<SignalProcessingFnInput<D>>;
    /**
     * The number of samples being processed per second.
     */
    sampleRate: number;
    /**
     * The index of the frame, or the number of frames (of size `windowSize`) that elapsed before this frame.
     */
    frameIndex: number;
    /**
     * The index of the channel whose data is currently being processed.
     *
     * Only defined when there is no channel dimension in the data, e.g. when `dimension` is `"time"` or `"none"`.
     */
    channelIndex: number | undefined;
    /**
     * The index of the sample currently being processed, between 0 and `windowSize -1`.
     *
     * Only defined when there is no time dimension in the data, e.g. when `dimension` is `"channel"` or `"none"`.
     */
    sampleIndex: number | undefined;
    /**
     * The length of the audio frame currently being processed.
     *
     * NOTE: When `dimension` is `"channel"` or `"none"`, each sample is processed separately by the function. In that case, `windowSize`  has no relationship to the input size and is an implementation detail.
     */
    windowSize: number;
    /**
     * The AudioContext time at which the processing of this function begins.
     *
     * When the inputs have a time dimension (if `dimension` is `"time"` or `"all"`), this represents the time of the first sample in the window. Otherwise, this value will be equal to the time at which the current sample is processed.
     */
    currentTime: number;
    numInputs: number;
    numOutputs: number;
    protected maxInputLookback: number;
    protected maxOutputLookback: number;
    protected fixedInputLookback: number;
    protected fixedOutputLookback: number;
    protected ioConverter: FrameToSignatureConverter<D>;
    constructor(inputMemory: MemoryBuffer<SignalProcessingFnInput<D>[]>, outputMemory: MemoryBuffer<SignalProcessingFnInput<D>>, { windowSize, currentTime, frameIndex, sampleRate, ioConverter, channelIndex, sampleIndex }: {
        windowSize: number;
        currentTime: number;
        frameIndex: number;
        sampleRate: number;
        ioConverter: FrameToSignatureConverter<D>;
        channelIndex?: number;
        sampleIndex?: number;
    });
    previousInputs(t?: number): SignalProcessingFnInput<D>[];
    previousOutputs(t?: number): SignalProcessingFnInput<D>;
    setOutputMemorySize(n: number): void;
    setInputMemorySize(n: number): void;
    execute(fn: Function, inputs: SignalProcessingFnInput<D>[]): SignalProcessingFnInput<D>[];
    protected static resizeMemory<T>(memory: MemoryBuffer<T>, maxLookback: number, lookbackOverride: number): void;
}

/**
 * A class collecting all current ongoing memory streams. Because some `dimension` settings process channels in parallel (`"none"` and `"time"`), memory streams are indexed by channel.
 */
declare class SignalProcessingContextFactory<D extends AudioDimension> {
    inputHistory: {
        [channel: number]: MemoryBuffer<SignalProcessingFnInput<D>[]>;
    };
    outputHistory: {
        [channel: number]: MemoryBuffer<SignalProcessingFnInput<D>>;
    };
    windowSize: number;
    sampleRate: number;
    inputSpec: StreamSpec;
    outputSpec: StreamSpec;
    getFrameIndex: () => number;
    getCurrentTime: () => number;
    ioConverter: FrameToSignatureConverter<D>;
    constructor({ inputSpec, outputSpec, windowSize, dimension, getFrameIndex, getCurrentTime, sampleRate, }: {
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
        windowSize: number;
        dimension: D;
        sampleRate: number;
        getFrameIndex: () => number;
        getCurrentTime: () => number;
    });
    protected getDefaultValueFn({ dimension, windowSize, numChannelsPerStream }: {
        dimension: AudioDimension;
        windowSize: number;
        numChannelsPerStream: number[];
    }): () => (number | ArrayLike$1<number> | MultiChannelArray<ArrayLike$1<number>>)[];
    getContext({ channelIndex, sampleIndex }?: {
        channelIndex?: number;
        sampleIndex?: number;
    }): SignalProcessingContext<D>;
}

type MappingFn<D extends AudioDimension> = (fn: Function, inputs: Float32Array[][], outputs: Float32Array[][], contextFactory: SignalProcessingContextFactory<D>) => number[];

declare abstract class AudioExecutionContext<D extends AudioDimension> extends ToStringAndUUID {
    fn: Function;
    dimension: D;
    abstract inputs: AudioNode[];
    abstract outputs: AudioNode[];
    protected applyToChunk: MappingFn<D>;
    constructor(fn: Function, dimension: D);
    protected processAudioFrame(inputChunks: Float32Array[][], outputChunks: Float32Array[][], contextFactory: SignalProcessingContextFactory<D>): number[];
    /**
     * Guess the number of output channels by applying the function to a fake input.
     */
    protected inferNumOutputChannels(inputSpec: StreamSpec, outputSpec: StreamSpec, windowSize?: number): number[];
    static create<D extends AudioDimension>(fn: Function, { useWorklet, dimension, inputSpec, outputSpec, windowSize, }: {
        useWorklet: boolean;
        dimension: D;
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
        windowSize: number | undefined;
    }): AudioExecutionContext<D>;
}
declare class WorkletExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
    inputs: AudioNode[];
    outputs: AudioNode[];
    constructor(fn: Function, { dimension, inputSpec, outputSpec }: {
        dimension: AudioDimension;
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
    });
    protected static defineAudioGraph(workletNode: AudioNode, { inputSpec, outputSpec, }: {
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
    }): {
        inputs: AudioNode[];
        outputs: AudioNode[];
    };
}
declare class ScriptProcessorExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
    fn: Function;
    inputs: AudioNode[];
    outputs: AudioNode[];
    inputSpec: StreamSpec;
    outputSpec: StreamSpec;
    windowSize: number;
    constructor(fn: Function, { dimension, inputSpec, outputSpec, windowSize, }: {
        dimension: AudioDimension;
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
        windowSize?: number;
    });
    protected static defineAudioGraph(processorNode: AudioNode, { inputSpec, outputSpec }: {
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
    }): {
        inputs: AudioNode[];
        outputs: AudioNode[];
    };
    private defineAudioProcessHandler;
    /**
     * Split out a flattened array of channels into separate inputs/outputs.
     */
    protected groupChannels(flatChannels: Float32Array[], channelsPerGroup: number[]): Float32Array[][];
    private processAudioEvent;
}
declare class AudioTransformComponent<D extends AudioDimension = "none"> extends BaseComponent {
    fn: Function;
    inputSpec: StreamSpec;
    outputSpec: StreamSpec;
    output: AbstractOutput<any>;
    protected executionContext: AudioExecutionContext<D>;
    constructor(fn: Function, { dimension, windowSize, inputSpec, outputSpec, useWorklet }?: {
        dimension?: D;
        windowSize?: number;
        inputSpec?: StreamSpec;
        outputSpec?: StreamSpec;
        useWorklet?: boolean;
    });
    private inferParamNames;
    withInputs(...inputs: Array<Connectable | unknown>): this;
    withInputs(inputDict: {
        [name: string]: Connectable | unknown;
    }): this;
}

declare class AudioRateSignalSampler extends BaseComponent {
    #private;
    private interval;
    audioInput: AudioRateInput;
    samplePeriodMs: ControlInput<number>;
    controlOutput: ControlOutput<number>;
    private _analyzer;
    constructor(samplePeriodMs?: number);
    getCurrentSignalValue(): number;
    stop(): void;
    inputAdded(source: AbstractOutput<any>): void;
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
}

declare class MidiListener extends ToStringAndUUID {
    listener: Function;
    protected listenerMap: {
        [id: string]: Function;
    };
    constructor(listener: Function, listenerMap: {
        [id: string]: Function;
    });
    remove(): void;
}
declare class MidiAccessListener extends MidiListener {
    onMidiAccessChange: (access: MIDIAccess, event?: MIDIConnectionEvent) => void;
    constructor(onMidiAccessChange: (access: MIDIAccess, event?: MIDIConnectionEvent) => void);
}
declare class MidiMessageListener extends MidiListener {
    onMidiMessage: (midiInput: MIDIInput, e: MIDIMessageEvent) => void;
    constructor(onMidiMessage: (midiInput: MIDIInput, e: MIDIMessageEvent) => void);
}

declare enum MidiLearnMode {
    /** Accept all messages matching the input device from the MIDI learn message. */
    INPUT = "input",
    /** Accept all messages matching the input device and status from the MIDI learn message. */
    STATUS = "status",
    /** Accept all messages matching the input device, status, and the first message byte (ex: pitch) from the MIDI learn message. */
    FIRST_BYTE = "first-byte"
}
declare class MidiLearn {
    static Mode: typeof MidiLearnMode;
    isInMidiLearnMode: boolean;
    learnMode: MidiLearnMode;
    learnedMidiInput: MIDIInput | undefined;
    learnedMidiEvent: MIDIMessageEvent | undefined;
    protected midiMessageListener: MidiMessageListener;
    protected $contextMenu: JQuery | undefined;
    protected onMidiLearnConnection: ((input: MIDIInput, data: Uint8Array) => void);
    protected onMidiMessage: ((event: MIDIMessageEvent) => void);
    constructor({ learnMode, contextMenuSelector, onMidiLearnConnection, onMidiMessage }?: {
        learnMode?: MidiLearnMode;
        contextMenuSelector?: string;
        onMidiLearnConnection?: ((input: MIDIInput, data: Uint8Array) => void);
        onMidiMessage?: ((event: MIDIMessageEvent) => void);
    });
    private addMidiLearnContextMenu;
    enterMidiLearnMode(): void;
    exitMidiLearnMode(): void;
    private matchesLearnedFilter;
    private midiMessageHandler;
}

interface NeedsDisplay<T> {
    display: NonNullable<T>;
}
declare abstract class VisualComponent<T extends BaseDisplay = any> extends BaseComponent implements NeedsDisplay<T> {
    #private;
    static defaultWidth?: number;
    static defaultHeight?: number;
    /**
     * The parent element that this and other IA components are children of.
     */
    $root: JQuery<HTMLDivElement> | undefined;
    /**
     * The direct parent container of the component, containing any component-independent elements.
     */
    $container: JQuery<HTMLDivElement> | undefined;
    abstract display: NonNullable<T>;
    $bypassIndicator: JQuery | undefined;
    /**
     * The unique DOM selector that only applies to this element.
     */
    uniqueDomSelector: string;
    constructor();
    static adjustSize($root: JQuery<HTMLDivElement>): void;
    static rotate($container: JQuery, rotateDeg: number): void;
    addToDom(iaRootElement: JQuery<HTMLDivElement>, { left, top, width, height, rotateDeg }?: {
        left?: number;
        top?: number;
        width?: number;
        height?: number;
        rotateDeg?: number;
    }): JQuery<HTMLDivElement>;
    refreshDom(): void;
    onMuteEvent(event: MuteEvent): void;
    onBypassEvent(event: BypassEvent): void;
}

declare abstract class BaseDisplay<T extends VisualComponent = any> {
    component: T;
    constructor(component: T);
    assertInitialized(): void;
    abstract _display($root: JQuery, width: number, height: number): void;
    _refreshDisplay<T>(input: ControlInput<T>, newValue: T): void;
}

declare class BangDisplay extends BaseDisplay {
    static PRESS_DURATION_MS: number;
    protected $button: JQuery<HTMLButtonElement> | undefined;
    _display($root: JQuery, width: number, height: number): void;
    showPressed(duration?: number): void;
    showUnpressed(): void;
}

declare class Bang extends VisualComponent<BangDisplay> {
    display: BangDisplay;
    readonly output: ControlOutput<typeof _default$2.TRIGGER>;
    static defaultHeight: number;
    static defaultWidth: number;
    protected midiLearn: MidiLearn;
    protected lastMidiValue: number;
    constructor();
    protected handleMidiInput(event: MIDIMessageEvent): void;
    connect(destination: CanBeConnectedTo): Component<AnyInput, AnyOutput> | undefined;
    trigger(): void;
}

type I = {
    time: AudioRateInput;
    buffer: ControlInput<AudioBuffer>;
};
type O = {
    output: AudioRateOutput;
};
declare class BufferComponent extends BaseComponent<I, O> {
    readonly time: AudioRateInput;
    readonly buffer: ControlInput<AudioBuffer>;
    readonly output: AudioRateOutput;
    protected worklet: AudioWorkletNode;
    constructor(buffer?: AudioBuffer);
    get bufferId(): string;
    setBuffer(buffer: AudioBuffer): void;
    protected inputDidUpdate(input: any, newValue: any): void;
}

declare class BufferWriterComponent extends BaseComponent {
    readonly position: AudioRateInput;
    readonly valueToWrite: AudioRateInput;
    readonly buffer: ControlInput<AudioBuffer>;
    protected worklet: AudioWorkletNode;
    constructor(buffer?: AudioBuffer);
    get bufferId(): string;
    setBuffer(buffer: AudioBuffer): void;
    protected handleMessage(floatData: Float32Array[]): void;
}

declare class ChannelSplitter extends BaseComponent implements Iterable<AudioRateOutput> {
    inputChannelGroups: number[][];
    outputChannels: AudioRateOutput[];
    protected splitter: ChannelSplitterNode;
    readonly input: AudioRateInput;
    length: number;
    [idx: number]: AudioRateOutput;
    constructor(...inputChannelGroups: number[][]);
    private createMergedOutputs;
    private mergeChannels;
    [Symbol.iterator](): Iterator<AudioRateOutput>;
}

declare class ChannelStacker extends BaseComponent {
    readonly stackedInputs: AudioRateInput[];
    readonly output: AudioRateOutput;
    [idx: number]: AudioRateInput;
    private constructor();
    static fromInputs(destinations: Connectable[]): ChannelStacker;
}

declare class ControlToAudioConverter extends BaseComponent {
    readonly input: ControlInput<number>;
    readonly output: AudioRateOutput;
    protected node: ConstantSourceNode;
    constructor();
    protected inputDidUpdate(input: any, newValue: any): void;
}

declare class HasDynamicInput {
    [key: string]: AbstractInput<unknown>;
}
declare class FunctionComponent<T0 = any, T1 = any, T2 = any, T3 = any, T4 = any, T5 = any, R = any> extends BaseComponent {
    fn: AnyFn<T0, T1, T2, T3, T4, T5, R>;
    readonly $0?: ControlInput<T0>;
    readonly $1?: ControlInput<T1>;
    readonly $2?: ControlInput<T2>;
    readonly $3?: ControlInput<T3>;
    readonly $4?: ControlInput<T4>;
    readonly $5?: ControlInput<T5>;
    output: ControlOutput<R>;
    protected _orderedFunctionInputs: Array<ControlInput<any>>;
    constructor(fn: Function);
    constructor(fn: () => R);
    constructor(fn: (a0?: T0) => R);
    constructor(fn: (a0?: T0, a1?: T1) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5, ...args: any[]) => R);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    __call__(...inputs: Array<Connectable | unknown>): this;
    __call__(inputDict: {
        [name: string]: Connectable | unknown;
    }): this;
    withInputs(...inputs: Array<Connectable | unknown>): this;
    withInputs(inputDict: {
        [name: string]: Connectable | unknown;
    }): this;
}
declare namespace FunctionComponent {
    type Dynamic = FunctionComponent & HasDynamicInput;
}

declare class FFTOutput extends CompoundOutput<{
    magnitude: AudioRateOutput;
    phase: AudioRateOutput;
    sync: AudioRateOutput;
}> implements FFTStream {
    name: string | number;
    parent?: Component | undefined;
    fftSize: number;
    magnitude: AudioRateOutput;
    phase: AudioRateOutput;
    sync: AudioRateOutput;
    constructor(name: string | number, magnitude: AudioRateOutput, phase: AudioRateOutput, sync: AudioRateOutput, parent?: Component | undefined, fftSize?: number);
    ifft(): AudioSignalStream;
}

declare class FFTComponent extends BaseComponent implements FFTStream {
    fftSize: number;
    readonly realInput: AudioRateInput;
    readonly imaginaryInput: AudioRateInput;
    readonly fftOut: FFTOutput;
    protected worklet: AudioWorkletNode;
    constructor(fftSize?: number);
    ifft(): AudioSignalStream;
}

declare class FFTInput extends CompoundInput<{
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

declare class IFFTComponent extends BaseComponent {
    fftSize: number;
    readonly fftIn: FFTInput;
    readonly realOutput: AudioRateOutput;
    readonly imaginaryOutput: AudioRateOutput;
    protected worklet: AudioWorkletNode;
    constructor(fftSize?: number);
}

declare class IgnoreDuplicates<T = any> extends BaseComponent {
    input: ControlInput<T>;
    output: ControlOutput<T>;
    private value;
    constructor();
    protected inputDidUpdate(input: ControlInput<T>, newValue: T): void;
}

declare class KeyboardDisplay extends BaseDisplay<Keyboard> {
    $keys: {
        [k: number]: JQuery<HTMLButtonElement>;
    };
    _display($root: JQuery, width: number, height: number): void;
    showKeyEvent(event: KeyEvent): void;
}

declare class Keyboard extends VisualComponent<KeyboardDisplay> {
    display: KeyboardDisplay;
    readonly numKeys: ControlInput<number>;
    readonly lowestPitch: ControlInput<number>;
    readonly midiInput: ControlInput<KeyEvent>;
    readonly midiOutput: ControlOutput<KeyEvent>;
    static defaultHeight: number;
    static defaultWidth: number;
    constructor(numKeys?: number, lowestPitch?: number);
    protected inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    get highestPitch(): number;
    private getKeyId;
    keyDown(keyNumber: number): void;
    keyUp(keyNumber: number): void;
}

type MaybeJQuery<T> = JQuery<T> | T;
declare class MediaElementComponent extends BaseComponent {
    readonly start: ControlInput<typeof _default$2.TRIGGER>;
    readonly stop: ControlInput<typeof _default$2.TRIGGER>;
    readonly volume: ControlInput<number>;
    readonly playbackRate: ControlInput<number>;
    readonly audioOutput: AudioRateOutput;
    mediaElement: HTMLMediaElement;
    audioNode: MediaElementAudioSourceNode;
    constructor(selectorOrElement: string | MaybeJQuery<HTMLMediaElement>, { preservePitchOnStretch }?: {
        preservePitchOnStretch?: boolean;
    });
    inputDidUpdate(input: any, newValue: any): void;
}

type MidiEvent = [number, number, number];
interface SupportsSelect {
    selectOptions: {
        id: string;
        name: string;
    }[];
    readonly selectedId: string | undefined;
    setOption(id: string): void;
}
declare enum DefaultDeviceBehavior {
    NONE = "none",
    ALL = "all",
    NEWEST = "newest"
}
type DeviceSelectorFn = (inputs: MIDIInput[]) => MIDIInput;
declare class MidiInputDevice extends VisualComponent implements SupportsSelect {
    defaultDeviceBehavior: DefaultDeviceBehavior | DeviceSelectorFn;
    display: any;
    readonly selectedDeviceInput: ControlInput<string>;
    readonly midiOut: ControlOutput<MidiEvent>;
    readonly availableDevices: ControlOutput<{
        [id: string]: MIDIInput;
    }>;
    readonly activeDevices: ControlOutput<MIDIInput[]>;
    selectOptions: {
        id: string;
        name: string;
    }[];
    selectedId: string | undefined;
    protected deviceMap: {
        [id: string]: MIDIInput;
    };
    protected accessListener: MidiAccessListener;
    protected messageListener: MidiMessageListener;
    protected midiLearn: MidiLearn;
    constructor(defaultDeviceBehavior?: DefaultDeviceBehavior | DeviceSelectorFn);
    protected static buildSelectOptions(inputMap: {
        [id: string]: MIDIInput;
    }): {
        id: string;
        name: string;
    }[];
    protected getSelectedMidiDevicesById(id: string): MIDIInput[];
    selectDevice(id: string): void;
    protected onMidiAccessChange(access: MIDIAccess, event?: MIDIConnectionEvent): void;
    protected autoSelectNewDevice(deviceMap: {
        [id: string]: MIDIInput;
    }, event?: MIDIConnectionEvent): string | undefined;
    protected sendMidiMessage(midiInput: MIDIInput, e: MIDIMessageEvent): void;
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    setOption(id: string): void;
}

declare abstract class RangeInputDisplay extends BaseDisplay<RangeInputComponent> {
    updateValue(value: number): void;
    updateMinValue(value: number): void;
    updateMaxValue(value: number): void;
    updateStep(value: number): void;
}
declare class KnobDisplay extends RangeInputDisplay {
    _display($root: JQuery, width: number, height: number): void;
}
declare class SliderDisplay extends RangeInputDisplay {
    #private;
    private $range?;
    _display($root: JQuery, width: number, height: number): void;
    updateValue(value: number): void;
    updateMinValue(value: number): void;
    updateMaxValue(value: number): void;
    updateStep(value: number): void;
}

declare class RangeInputComponent extends VisualComponent<RangeInputDisplay> {
    display: RangeInputDisplay;
    readonly minValue: ControlInput<number>;
    readonly maxValue: ControlInput<number>;
    readonly step: ControlInput<number>;
    readonly input: ControlInput<number>;
    readonly output: ControlOutput<number>;
    protected midiLearn: MidiLearn;
    static Type: typeof RangeType;
    constructor(minValue?: number, maxValue?: number, step?: number, defaultValue?: number, displayType?: RangeType);
    protected handleMidiUpdate(event: MIDIMessageEvent): void;
    protected updateValue(newValue: number): void;
    inputDidUpdate(input: any, newValue: any): void;
}

declare class ScrollingAudioMonitorDisplay extends BaseDisplay<ScrollingAudioMonitor> {
    #private;
    private $canvas?;
    private $maxValueDisplay?;
    private $minValueDisplay?;
    private $container?;
    private currMaxValue?;
    private currMinValue?;
    _display($container: JQuery<HTMLDivElement>, width: number, height: number): void;
    updateWaveformDisplay(): void;
    drawSingleWaveform(ctx: CanvasRenderingContext2D, values: number[], strokeStyle: string, toX: (v: number) => number, toY: (v: number) => number): void;
}

declare class ScrollingAudioMonitor extends VisualComponent<ScrollingAudioMonitorDisplay> {
    #private;
    display: ScrollingAudioMonitorDisplay;
    hideZeroSignal: ControlInput<boolean>;
    samplePeriodMs: ControlInput<number>;
    memorySize: ControlInput<number>;
    minValue: ControlInput<number | 'auto'>;
    maxValue: ControlInput<number | 'auto'>;
    input: AudioRateInput;
    audioOutput: AudioRateOutput;
    controlOutput: ControlOutput<number[]>;
    _memory: number[][];
    private _analyzers;
    private _splitter;
    private _merger;
    static defaultHeight: number;
    static defaultWidth: number;
    constructor(samplePeriodMs?: number, memorySize?: number, minValue?: number | 'auto', maxValue?: number | 'auto', hideZeroSignal?: boolean, numChannels?: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    getCurrentValueRange(): {
        minValue: number;
        maxValue: number;
    };
}

declare class SimplePolyphonicSynth extends BaseComponent {
    #private;
    readonly numNotes: ControlInput<number>;
    readonly waveform: ControlInput<WaveType>;
    readonly midiInput: ControlInput<KeyEvent>;
    readonly audioOutput: AudioRateOutput;
    private _soundNodes;
    private _currNodeIdx;
    protected _masterGainNode: GainNode;
    constructor(numNotes?: number, waveform?: WaveType);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    onKeyEvent(event: KeyEvent): void;
}

declare class SlowDown extends BaseComponent {
    rate: number;
    bufferLengthSec: number;
    delayNode: DelayNode;
    delayModulator: ConstantSourceNode;
    readonly audioInput: AudioRateInput;
    readonly audioOutput: AudioRateOutput;
    readonly rampOut: AudioRateOutput;
    constructor(rate?: number, bufferLengthSec?: number);
    start(): void;
    mapFn(v: number): number;
}

declare class TimeVaryingSignal extends AudioTransformComponent {
    static TimeMeasure: typeof TimeMeasure;
    constructor(generatorFn: (t: number) => number, timeMeasure?: TimeMeasure);
}

declare class TypingKeyboardMIDI extends BaseComponent {
    #private;
    static OCTAVE_DOWN_KEY: string;
    static OCTAVE_UP_KEY: string;
    static CHROMATIC_KEY_SEQUENCE: string;
    readonly velocity: ControlInput<number>;
    readonly octaveInput: ControlInput<number>;
    readonly midiInput: ControlInput<KeyEvent>;
    readonly midiOutput: ControlOutput<KeyEvent>;
    readonly octaveOutput: ControlOutput<number>;
    constructor(velocity?: number, octave?: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
}

declare class Wave extends BaseComponent {
    type: ControlInput<WaveType>;
    waveTable: ControlInput<PeriodicWave>;
    frequency: AudioRateInput;
    output: AudioRateOutput;
    private _oscillatorNode;
    static Type: typeof WaveType;
    constructor(wavetableOrType: PeriodicWave | WaveType, frequency: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    static fromPartials(frequency: number, magnitudes: Array<number>, phases?: Array<number>): Wave;
    static fromCoefficients(frequency: number, real: Iterable<number>, imaginary?: Iterable<number>): Wave;
}

declare function getNumInputChannels(node: WebAudioConnectable): any;
declare function getNumOutputChannels(node: WebAudioConnectable): any;
declare function createMultiChannelView<T extends MultiChannel>(multiChannelIO: T, supportsMultichannel: boolean): MultiChannelArray<T>;
/**
 * Call the correct WebAudio methods to connect the selected channels, if any.
 * TODO: Bring channel splitter / merger logic into the components,
 * lazy-initialized when channels is accessed.
 *
 * @param source
 * @param destination
 * @param fromChannel
 * @param toChannel
 */
declare function connectWebAudioChannels(audioContext: AudioContext, source: AudioNode, destination: WebAudioConnectable, fromChannel?: number | undefined, toChannel?: number | undefined): void | AudioNode;

type NodeInfo = {
    analyzers: AnalyserNode[];
    formatString: string;
};
declare class SignalLogger extends ToStringAndUUID {
    samplePeriodMs: number;
    analysers: NodeInfo[];
    protected interval: number | undefined;
    constructor(samplePeriodMs?: number);
    start(): void;
    stop(): void;
    /**
     * Register a node to be monitored.
     */
    register(output: AudioRateOutput, formatString: string): void;
}

type internalNamespace_ADSR = ADSR;
declare const internalNamespace_ADSR: typeof ADSR;
type internalNamespace_AbstractInput<T = any> = AbstractInput<T>;
declare const internalNamespace_AbstractInput: typeof AbstractInput;
type internalNamespace_AbstractOutput<T = any> = AbstractOutput<T>;
declare const internalNamespace_AbstractOutput: typeof AbstractOutput;
type internalNamespace_AnyFn<T0, T1, T2, T3, T4, T5, ReturnType> = AnyFn<T0, T1, T2, T3, T4, T5, ReturnType>;
type internalNamespace_AnyInput = AnyInput;
type internalNamespace_AnyOutput = AnyOutput;
type internalNamespace_AudioComponent = AudioComponent;
declare const internalNamespace_AudioComponent: typeof AudioComponent;
type internalNamespace_AudioConfig = AudioConfig;
type internalNamespace_AudioExecutionContext<D extends AudioDimension> = AudioExecutionContext<D>;
declare const internalNamespace_AudioExecutionContext: typeof AudioExecutionContext;
type internalNamespace_AudioRateInput = AudioRateInput;
declare const internalNamespace_AudioRateInput: typeof AudioRateInput;
type internalNamespace_AudioRateOutput = AudioRateOutput;
declare const internalNamespace_AudioRateOutput: typeof AudioRateOutput;
type internalNamespace_AudioRateSignalSampler = AudioRateSignalSampler;
declare const internalNamespace_AudioRateSignalSampler: typeof AudioRateSignalSampler;
type internalNamespace_AudioRecordingComponent = AudioRecordingComponent;
declare const internalNamespace_AudioRecordingComponent: typeof AudioRecordingComponent;
type internalNamespace_AudioTransformComponent<D extends AudioDimension = "none"> = AudioTransformComponent<D>;
declare const internalNamespace_AudioTransformComponent: typeof AudioTransformComponent;
type internalNamespace_Bang = Bang;
declare const internalNamespace_Bang: typeof Bang;
type internalNamespace_BangDisplay = BangDisplay;
declare const internalNamespace_BangDisplay: typeof BangDisplay;
type internalNamespace_BaseComponent<InputTypes extends AnyInput = AnyInput, OutputTypes extends AnyOutput = AnyOutput> = BaseComponent<InputTypes, OutputTypes>;
declare const internalNamespace_BaseComponent: typeof BaseComponent;
type internalNamespace_BaseConnectable = BaseConnectable;
declare const internalNamespace_BaseConnectable: typeof BaseConnectable;
type internalNamespace_BaseDisplay<T extends VisualComponent = any> = BaseDisplay<T>;
declare const internalNamespace_BaseDisplay: typeof BaseDisplay;
type internalNamespace_BaseEvent = BaseEvent;
declare const internalNamespace_BaseEvent: typeof BaseEvent;
type internalNamespace_BufferComponent = BufferComponent;
declare const internalNamespace_BufferComponent: typeof BufferComponent;
type internalNamespace_BufferWriterComponent = BufferWriterComponent;
declare const internalNamespace_BufferWriterComponent: typeof BufferWriterComponent;
type internalNamespace_Bundle<T> = Bundle<T>;
type internalNamespace_BundleComponent<ComponentDict extends ObjectOf<Component>> = BundleComponent<ComponentDict>;
declare const internalNamespace_BundleComponent: typeof BundleComponent;
type internalNamespace_BypassEvent = BypassEvent;
declare const internalNamespace_BypassEvent: typeof BypassEvent;
type internalNamespace_CanBeConnectedTo = CanBeConnectedTo;
type internalNamespace_ChannelSplitter = ChannelSplitter;
declare const internalNamespace_ChannelSplitter: typeof ChannelSplitter;
type internalNamespace_ChannelStacker = ChannelStacker;
declare const internalNamespace_ChannelStacker: typeof ChannelStacker;
type internalNamespace_ComponentInput<T> = ComponentInput<T>;
declare const internalNamespace_ComponentInput: typeof ComponentInput;
type internalNamespace_CompoundInput<InputsDict extends ObjectOf<AbstractInput>> = CompoundInput<InputsDict>;
declare const internalNamespace_CompoundInput: typeof CompoundInput;
type internalNamespace_CompoundOutput<OutputsDict extends ObjectOf<AbstractOutput>> = CompoundOutput<OutputsDict>;
declare const internalNamespace_CompoundOutput: typeof CompoundOutput;
type internalNamespace_Constructor<T = any> = Constructor<T>;
type internalNamespace_ControlInput<T> = ControlInput<T>;
declare const internalNamespace_ControlInput: typeof ControlInput;
type internalNamespace_ControlOutput<T> = ControlOutput<T>;
declare const internalNamespace_ControlOutput: typeof ControlOutput;
type internalNamespace_ControlToAudioConverter = ControlToAudioConverter;
declare const internalNamespace_ControlToAudioConverter: typeof ControlToAudioConverter;
type internalNamespace_DefaultDeviceBehavior = DefaultDeviceBehavior;
declare const internalNamespace_DefaultDeviceBehavior: typeof DefaultDeviceBehavior;
type internalNamespace_Disconnect = Disconnect;
declare const internalNamespace_Disconnect: typeof Disconnect;
type internalNamespace_FFTComponent = FFTComponent;
declare const internalNamespace_FFTComponent: typeof FFTComponent;
type internalNamespace_FFTInput = FFTInput;
declare const internalNamespace_FFTInput: typeof FFTInput;
type internalNamespace_FFTOutput = FFTOutput;
declare const internalNamespace_FFTOutput: typeof FFTOutput;
declare const internalNamespace_FunctionComponent: typeof FunctionComponent;
type internalNamespace_HybridInput<T> = HybridInput<T>;
declare const internalNamespace_HybridInput: typeof HybridInput;
type internalNamespace_HybridOutput<T = any> = HybridOutput<T>;
declare const internalNamespace_HybridOutput: typeof HybridOutput;
type internalNamespace_IFFTComponent = IFFTComponent;
declare const internalNamespace_IFFTComponent: typeof IFFTComponent;
type internalNamespace_IgnoreDuplicates<T = any> = IgnoreDuplicates<T>;
declare const internalNamespace_IgnoreDuplicates: typeof IgnoreDuplicates;
type internalNamespace_KeyEvent = KeyEvent;
declare const internalNamespace_KeyEvent: typeof KeyEvent;
type internalNamespace_KeyEventType = KeyEventType;
declare const internalNamespace_KeyEventType: typeof KeyEventType;
type internalNamespace_Keyboard = Keyboard;
declare const internalNamespace_Keyboard: typeof Keyboard;
type internalNamespace_KeyboardDisplay = KeyboardDisplay;
declare const internalNamespace_KeyboardDisplay: typeof KeyboardDisplay;
type internalNamespace_KeysLike<T, V> = KeysLike<T, V>;
type internalNamespace_KnobDisplay = KnobDisplay;
declare const internalNamespace_KnobDisplay: typeof KnobDisplay;
type internalNamespace_MaybePromise<T> = MaybePromise<T>;
type internalNamespace_MaybePromises<T> = MaybePromises<T>;
type internalNamespace_MediaElementComponent = MediaElementComponent;
declare const internalNamespace_MediaElementComponent: typeof MediaElementComponent;
type internalNamespace_MidiAccessListener = MidiAccessListener;
declare const internalNamespace_MidiAccessListener: typeof MidiAccessListener;
type internalNamespace_MidiInputDevice = MidiInputDevice;
declare const internalNamespace_MidiInputDevice: typeof MidiInputDevice;
type internalNamespace_MidiLearn = MidiLearn;
declare const internalNamespace_MidiLearn: typeof MidiLearn;
type internalNamespace_MidiMessageListener = MidiMessageListener;
declare const internalNamespace_MidiMessageListener: typeof MidiMessageListener;
type internalNamespace_MultiChannel<T extends (AbstractInput | AbstractOutput) = any> = MultiChannel<T>;
type internalNamespace_MuteEvent = MuteEvent;
declare const internalNamespace_MuteEvent: typeof MuteEvent;
type internalNamespace_ObjectOf<T> = ObjectOf<T>;
type internalNamespace_ObjectOrArrayOf<T> = ObjectOrArrayOf<T>;
type internalNamespace_RangeInputComponent = RangeInputComponent;
declare const internalNamespace_RangeInputComponent: typeof RangeInputComponent;
type internalNamespace_RangeInputDisplay = RangeInputDisplay;
declare const internalNamespace_RangeInputDisplay: typeof RangeInputDisplay;
type internalNamespace_RangeType = RangeType;
declare const internalNamespace_RangeType: typeof RangeType;
type internalNamespace_ScriptProcessorExecutionContext<D extends AudioDimension> = ScriptProcessorExecutionContext<D>;
declare const internalNamespace_ScriptProcessorExecutionContext: typeof ScriptProcessorExecutionContext;
type internalNamespace_ScrollingAudioMonitor = ScrollingAudioMonitor;
declare const internalNamespace_ScrollingAudioMonitor: typeof ScrollingAudioMonitor;
type internalNamespace_ScrollingAudioMonitorDisplay = ScrollingAudioMonitorDisplay;
declare const internalNamespace_ScrollingAudioMonitorDisplay: typeof ScrollingAudioMonitorDisplay;
type internalNamespace_SignalLogger = SignalLogger;
declare const internalNamespace_SignalLogger: typeof SignalLogger;
type internalNamespace_SimplePolyphonicSynth = SimplePolyphonicSynth;
declare const internalNamespace_SimplePolyphonicSynth: typeof SimplePolyphonicSynth;
type internalNamespace_SliderDisplay = SliderDisplay;
declare const internalNamespace_SliderDisplay: typeof SliderDisplay;
type internalNamespace_SlowDown = SlowDown;
declare const internalNamespace_SlowDown: typeof SlowDown;
type internalNamespace_SupportsSelect = SupportsSelect;
type internalNamespace_TimeMeasure = TimeMeasure;
declare const internalNamespace_TimeMeasure: typeof TimeMeasure;
type internalNamespace_TimeVaryingSignal = TimeVaryingSignal;
declare const internalNamespace_TimeVaryingSignal: typeof TimeVaryingSignal;
type internalNamespace_ToStringAndUUID = ToStringAndUUID;
declare const internalNamespace_ToStringAndUUID: typeof ToStringAndUUID;
type internalNamespace_TypedConfigurable = TypedConfigurable;
declare const internalNamespace_TypedConfigurable: typeof TypedConfigurable;
type internalNamespace_TypingKeyboardMIDI = TypingKeyboardMIDI;
declare const internalNamespace_TypingKeyboardMIDI: typeof TypingKeyboardMIDI;
type internalNamespace_VisualComponent<T extends BaseDisplay = any> = VisualComponent<T>;
declare const internalNamespace_VisualComponent: typeof VisualComponent;
type internalNamespace_Wave = Wave;
declare const internalNamespace_Wave: typeof Wave;
type internalNamespace_WaveType = WaveType;
declare const internalNamespace_WaveType: typeof WaveType;
type internalNamespace_WebAudioConnectable = WebAudioConnectable;
type internalNamespace_WorkletExecutionContext<D extends AudioDimension> = WorkletExecutionContext<D>;
declare const internalNamespace_WorkletExecutionContext: typeof WorkletExecutionContext;
declare const internalNamespace_connectWebAudioChannels: typeof connectWebAudioChannels;
declare const internalNamespace_createMultiChannelView: typeof createMultiChannelView;
declare const internalNamespace_disconnect: typeof disconnect;
declare const internalNamespace_getNumInputChannels: typeof getNumInputChannels;
declare const internalNamespace_getNumOutputChannels: typeof getNumOutputChannels;
declare const internalNamespace_lazyProperty: typeof lazyProperty;
declare const internalNamespace_resolvePromiseArgs: typeof resolvePromiseArgs;
declare namespace internalNamespace {
  export { internalNamespace_ADSR as ADSR, internalNamespace_AbstractInput as AbstractInput, internalNamespace_AbstractOutput as AbstractOutput, type internalNamespace_AnyFn as AnyFn, type internalNamespace_AnyInput as AnyInput, type internalNamespace_AnyOutput as AnyOutput, internalNamespace_AudioComponent as AudioComponent, type internalNamespace_AudioConfig as AudioConfig, internalNamespace_AudioExecutionContext as AudioExecutionContext, internalNamespace_AudioRateInput as AudioRateInput, internalNamespace_AudioRateOutput as AudioRateOutput, internalNamespace_AudioRateSignalSampler as AudioRateSignalSampler, internalNamespace_AudioRecordingComponent as AudioRecordingComponent, internalNamespace_AudioTransformComponent as AudioTransformComponent, internalNamespace_Bang as Bang, internalNamespace_BangDisplay as BangDisplay, internalNamespace_BaseComponent as BaseComponent, internalNamespace_BaseConnectable as BaseConnectable, internalNamespace_BaseDisplay as BaseDisplay, internalNamespace_BaseEvent as BaseEvent, internalNamespace_BufferComponent as BufferComponent, internalNamespace_BufferWriterComponent as BufferWriterComponent, type internalNamespace_Bundle as Bundle, internalNamespace_BundleComponent as BundleComponent, internalNamespace_BypassEvent as BypassEvent, type internalNamespace_CanBeConnectedTo as CanBeConnectedTo, internalNamespace_ChannelSplitter as ChannelSplitter, internalNamespace_ChannelStacker as ChannelStacker, internalNamespace_ComponentInput as ComponentInput, internalNamespace_CompoundInput as CompoundInput, internalNamespace_CompoundOutput as CompoundOutput, type internalNamespace_Constructor as Constructor, internalNamespace_ControlInput as ControlInput, internalNamespace_ControlOutput as ControlOutput, internalNamespace_ControlToAudioConverter as ControlToAudioConverter, internalNamespace_DefaultDeviceBehavior as DefaultDeviceBehavior, internalNamespace_Disconnect as Disconnect, internalNamespace_FFTComponent as FFTComponent, internalNamespace_FFTInput as FFTInput, internalNamespace_FFTOutput as FFTOutput, internalNamespace_FunctionComponent as FunctionComponent, internalNamespace_HybridInput as HybridInput, internalNamespace_HybridOutput as HybridOutput, internalNamespace_IFFTComponent as IFFTComponent, internalNamespace_IgnoreDuplicates as IgnoreDuplicates, internalNamespace_KeyEvent as KeyEvent, internalNamespace_KeyEventType as KeyEventType, internalNamespace_Keyboard as Keyboard, internalNamespace_KeyboardDisplay as KeyboardDisplay, type internalNamespace_KeysLike as KeysLike, internalNamespace_KnobDisplay as KnobDisplay, type internalNamespace_MaybePromise as MaybePromise, type internalNamespace_MaybePromises as MaybePromises, internalNamespace_MediaElementComponent as MediaElementComponent, internalNamespace_MidiAccessListener as MidiAccessListener, internalNamespace_MidiInputDevice as MidiInputDevice, internalNamespace_MidiLearn as MidiLearn, internalNamespace_MidiMessageListener as MidiMessageListener, type internalNamespace_MultiChannel as MultiChannel, internalNamespace_MuteEvent as MuteEvent, type internalNamespace_ObjectOf as ObjectOf, type internalNamespace_ObjectOrArrayOf as ObjectOrArrayOf, internalNamespace_RangeInputComponent as RangeInputComponent, internalNamespace_RangeInputDisplay as RangeInputDisplay, internalNamespace_RangeType as RangeType, internalNamespace_ScriptProcessorExecutionContext as ScriptProcessorExecutionContext, internalNamespace_ScrollingAudioMonitor as ScrollingAudioMonitor, internalNamespace_ScrollingAudioMonitorDisplay as ScrollingAudioMonitorDisplay, internalNamespace_SignalLogger as SignalLogger, internalNamespace_SimplePolyphonicSynth as SimplePolyphonicSynth, internalNamespace_SliderDisplay as SliderDisplay, internalNamespace_SlowDown as SlowDown, type internalNamespace_SupportsSelect as SupportsSelect, internalNamespace_TimeMeasure as TimeMeasure, internalNamespace_TimeVaryingSignal as TimeVaryingSignal, internalNamespace_ToStringAndUUID as ToStringAndUUID, internalNamespace_TypedConfigurable as TypedConfigurable, internalNamespace_TypingKeyboardMIDI as TypingKeyboardMIDI, internalNamespace_VisualComponent as VisualComponent, internalNamespace_Wave as Wave, internalNamespace_WaveType as WaveType, type internalNamespace_WebAudioConnectable as WebAudioConnectable, internalNamespace_WorkletExecutionContext as WorkletExecutionContext, internalNamespace_connectWebAudioChannels as connectWebAudioChannels, _default$2 as constants, internalNamespace_createMultiChannelView as createMultiChannelView, internalNamespace_disconnect as disconnect, events_d as events, internalNamespace_getNumInputChannels as getNumInputChannels, internalNamespace_getNumOutputChannels as getNumOutputChannels, internalNamespace_lazyProperty as lazyProperty, internalNamespace_resolvePromiseArgs as resolvePromiseArgs, util_d as util };
}

declare const _default$1: {
    constants: Readonly<{
        MUTED_CLASS: "component-muted";
        BYPASSED_CLASS: "component-bypassed";
        COMPONENT_CONTAINER_CLASS: "modular-container";
        KEYBOARD_KEY_CLASS: "keyboard-key";
        KEYBOARD_KEY_PRESSED_CLASS: "keyboard-key-pressed";
        BYPASS_INDICATOR_CLASS: "bypass-indicator";
        MONITOR_VALUE_CLASS: "monitor-value";
        MONITOR_OUT_OF_BOUNDS_CLASS: "monitor-out-of-bounds";
        UNINITIALIZED_CLASS: "component-uninitialized";
        BANG_CLASS: "bang";
        BANG_PRESSED_CLASS: "bang-pressed";
        MIDI_LEARN_LISTENING_CLASS: "midi-learn-listening";
        MIDI_LEARN_ASSIGNED_CLASS: "midi-learn-assigned";
        EVENT_AUDIOPROCESS: "audioprocess";
        EVENT_MOUSEDOWN: "mousedown";
        EVENT_MOUSEUP: "mouseup";
        TRIGGER: symbol;
        MIN_PLAYBACK_RATE: 0.0625;
        MAX_PLAYBACK_RATE: 16;
        MAX_CHANNELS: 32;
        DEFAULT_NUM_CHANNELS: 2;
        MAX_ANALYZER_LENGTH: 32768;
        UNSET_VALUE: undefined;
    }>;
    events: typeof events_d;
    util: typeof util_d;
    lazyProperty(initializer: (thisObj: any, propName?: string) => any): (target: any, prop: string) => void;
    resolvePromiseArgs<I extends any[], O>(obj: any, propName: string, descriptor: PropertyDescriptor): TypedPropertyDescriptor<((...args: MaybePromises<I>) => MaybePromise<O>) | ((...args: I) => O)>;
    ADSR: typeof ADSR;
    AudioComponent: typeof AudioComponent;
    AudioRecordingComponent: typeof AudioRecordingComponent;
    AudioExecutionContext: typeof AudioExecutionContext;
    WorkletExecutionContext: typeof WorkletExecutionContext;
    ScriptProcessorExecutionContext: typeof ScriptProcessorExecutionContext;
    AudioTransformComponent: typeof AudioTransformComponent;
    AudioRateSignalSampler: typeof AudioRateSignalSampler;
    Bang: typeof Bang;
    BaseComponent: typeof BaseComponent;
    VisualComponent: typeof VisualComponent;
    BufferComponent: typeof BufferComponent;
    BufferWriterComponent: typeof BufferWriterComponent;
    ChannelSplitter: typeof ChannelSplitter;
    ChannelStacker: typeof ChannelStacker;
    ControlToAudioConverter: typeof ControlToAudioConverter;
    FunctionComponent: typeof FunctionComponent;
    FFTComponent: typeof FFTComponent;
    IFFTComponent: typeof IFFTComponent;
    BundleComponent: typeof BundleComponent;
    IgnoreDuplicates: typeof IgnoreDuplicates;
    Keyboard: typeof Keyboard;
    MediaElementComponent: typeof MediaElementComponent;
    DefaultDeviceBehavior: typeof DefaultDeviceBehavior;
    MidiInputDevice: typeof MidiInputDevice;
    RangeInputComponent: typeof RangeInputComponent;
    ScrollingAudioMonitor: typeof ScrollingAudioMonitor;
    SimplePolyphonicSynth: typeof SimplePolyphonicSynth;
    SlowDown: typeof SlowDown;
    TimeVaryingSignal: typeof TimeVaryingSignal;
    TypingKeyboardMIDI: typeof TypingKeyboardMIDI;
    Wave: typeof Wave;
    AbstractInput: typeof AbstractInput;
    AudioRateInput: typeof AudioRateInput;
    CompoundInput: typeof CompoundInput;
    ComponentInput: typeof ComponentInput;
    ControlInput: typeof ControlInput;
    FFTInput: typeof FFTInput;
    HybridInput: typeof HybridInput;
    AbstractOutput: typeof AbstractOutput;
    AudioRateOutput: typeof AudioRateOutput;
    CompoundOutput: typeof CompoundOutput;
    ControlOutput: typeof ControlOutput;
    FFTOutput: typeof FFTOutput;
    HybridOutput: typeof HybridOutput;
    BaseConnectable: typeof BaseConnectable;
    ToStringAndUUID: typeof ToStringAndUUID;
    TypedConfigurable: typeof TypedConfigurable;
    MidiAccessListener: typeof MidiAccessListener;
    MidiMessageListener: typeof MidiMessageListener;
    MidiLearn: typeof MidiLearn;
    getNumInputChannels(node: WebAudioConnectable): any;
    getNumOutputChannels(node: WebAudioConnectable): any;
    createMultiChannelView<T extends MultiChannel>(multiChannelIO: T, supportsMultichannel: boolean): MultiChannelArray<T>;
    connectWebAudioChannels(audioContext: AudioContext, source: AudioNode, destination: WebAudioConnectable, fromChannel?: number | undefined, toChannel?: number | undefined): void | AudioNode;
    BaseEvent: typeof BaseEvent;
    BypassEvent: typeof BypassEvent;
    MuteEvent: typeof MuteEvent;
    KeyEventType: typeof KeyEventType;
    KeyEvent: typeof KeyEvent;
    SignalLogger: typeof SignalLogger;
    Disconnect: typeof Disconnect;
    disconnect: () => never;
    WaveType: typeof WaveType;
    RangeType: typeof RangeType;
    TimeMeasure: typeof TimeMeasure;
    BangDisplay: typeof BangDisplay;
    BaseDisplay: typeof BaseDisplay;
    KeyboardDisplay: typeof KeyboardDisplay;
    RangeInputDisplay: typeof RangeInputDisplay;
    KnobDisplay: typeof KnobDisplay;
    SliderDisplay: typeof SliderDisplay;
    ScrollingAudioMonitorDisplay: typeof ScrollingAudioMonitorDisplay;
};

declare abstract class TypedConfigurable extends CallableInstance<any, any> implements stache.Configurable {
    constructor();
    static config: AudioConfig;
    static _: typeof _default$1;
    static configId: string;
    config: AudioConfig;
    _: typeof _default$1;
    configId: string;
    __call__(__forbiddenCall: any): void;
}
type AudioConfig = {
    audioContext: AudioContext;
    state: {
        isInitialized: boolean;
        workletIsAvailable: boolean;
    };
    logger: SignalLogger;
    defaultSamplePeriodMs: number;
    useWorkletByDefault: boolean;
    workletPath: string;
};

declare class ToStringAndUUID extends TypedConfigurable {
    _uuid: string;
    constructor();
    get _className(): any;
    toString(): any;
    get audioContext(): AudioContext;
    static get audioContext(): AudioContext;
}

declare abstract class AbstractInput<T = any> extends ToStringAndUUID implements HasTypeValidator {
    name: string | number;
    parent: Component | undefined;
    isRequired: boolean;
    protected validate: (value: any) => void;
    constructor(name: string | number, parent: Component | undefined, isRequired: boolean);
    abstract get value(): T | undefined;
    abstract setValue(value: T): void;
    abstract get numInputChannels(): number;
    get defaultInput(): AbstractInput | undefined;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
    __call__(value?: T | typeof _default$2.TRIGGER): void;
    trigger(): void;
    toString(): string;
    ofType(type: Constructor | string): this;
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn: (v: any) => boolean | void): this;
}

interface Component<InputTypes extends AnyInput = AnyInput, OutputTypes extends AnyOutput = AnyOutput> extends ToStringAndUUID, BaseConnectable {
    readonly isComponent: true;
    isBypassed: ControlInput<boolean>;
    isMuted: ControlInput<boolean>;
    triggerInput: ControlInput<typeof _default$2.TRIGGER>;
    outputs: OutputTypes;
    inputs: InputTypes;
    get defaultInput(): ComponentInput<unknown>;
    getDefaultInput(): ComponentInput<unknown>;
    setBypassed(isBypassed?: boolean): void;
    setMuted(isMuted?: boolean): void;
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    withInputs(inputDict: {
        [name: string]: Connectable;
    }): Component;
    setValues(valueObj: ObjectOf<any>): void;
    wasConnectedTo(other: Connectable): void;
    sampleSignal(samplePeriodMs?: number): Component;
    propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T): void;
}

declare class IATopLevel {
    config: AudioConfig;
    internals: typeof internalNamespace;
    out: AudioRateInput;
    util: typeof util_d;
    constructor(config: AudioConfig, internals: typeof internalNamespace);
    get audioContext(): AudioContext;
    private gestureListeners;
    private runCalled;
    private createInitListeners;
    isInitialized: boolean;
    private init;
    /**
     * Register a function to be called once the audio engine is ready and a user gesture has been performed.
     *
     * @param callback A function to run once the audio engine is ready.
     */
    run(callback: (ctx?: AudioContext) => void): void;
    withConfig(customConfigOptions?: Partial<AudioConfig>, configId?: string): IATopLevel;
    stackChannels(inputs: Connectable[]): ChannelStacker;
    generate(fn: (t: number) => number, timeMeasure?: TimeMeasure): TimeVaryingSignal;
    combine(inputs: Connectable[] | ObjectOf<Connectable>, fn: Function, options?: {}): Component;
    bundle(inputs: ObjectOrArrayOf<Component>): BundleComponent<ObjectOf<Component<AnyInput, AnyOutput>>>;
    ramp(units: TimeMeasure): Connectable;
    read(fname: string): Promise<AudioBuffer>;
    bufferReader(fname: string): BufferComponent;
    bufferReader(buffer: MaybePromise<AudioBuffer>): BufferComponent;
    bufferWriter(buffer: AudioBuffer): BufferWriterComponent;
    recorder(sources: Connectable[]): AudioRecordingComponent;
    recorder(sourceAudio: Connectable): AudioRecordingComponent;
    /**
     * Allow joining ("mixing") across multiple audioContexts / threads.
     */
    join(sources: BaseConnectable[]): AudioComponent;
    createThread({ name, audioContext, ...options }?: Partial<AudioConfig> & {
        name?: string;
    }): Promise<IATopLevel>;
}

declare const _default: IATopLevel;

export { _default as default };
