import { AudioRecordingComponent } from "./components/AudioRecordingComponent.js";
import { BufferComponent } from "./components/BufferComponent.js";
import { BufferWriterComponent } from "./components/BufferWriterComponent.js";
import { Component } from "./components/base/Component.js";
import { AudioRateInput } from "./io/input/AudioRateInput.js";
import { BaseConnectable } from "./shared/base/BaseConnectable.js";
import { Connectable } from "./shared/base/Connectable.js";
import { AudioConfig } from "./shared/config.js";
import { AnyFn, MaybePromise, ObjectOf, ObjectOrArrayOf, TimeMeasure } from "./shared/types.js";
import * as internalNamespace from './internals.js';
export declare class IATopLevel {
    config: AudioConfig;
    internals: typeof internalNamespace;
    out: AudioRateInput;
    util: typeof internalNamespace.util;
    constructor(config: AudioConfig, internals: typeof internalNamespace);
    get audioContext(): AudioContext;
    private listeners;
    private initStarted;
    private createInitListeners;
    isInitialized: boolean;
    private onSuccessfulInit;
    /**
     * Register a function to be called once the audio engine is ready and a user gesture has been performed.
     *
     * @param callback A function to run once the audio engine is ready.
     */
    run<T>(callback: (ctx?: AudioContext) => T): Promise<T>;
    init(): Promise<boolean>;
    withConfig(customConfigOptions?: Partial<AudioConfig>, configId?: string): IATopLevel;
    disconnectAll(): void;
    stackChannels(inputs: Connectable[]): internalNamespace.ChannelStacker;
    generate(fn: (t: number) => number, timeMeasure?: TimeMeasure): internalNamespace.TimeVaryingSignal;
    combine(inputs: Connectable[] | ObjectOf<Connectable>, fn: Function, options?: {}): Component;
    bundle(inputs: ObjectOrArrayOf<Component>): internalNamespace.BundleComponent<ObjectOf<Component<internalNamespace.AnyInput, internalNamespace.AnyOutput>>>;
    ramp(units: TimeMeasure): Connectable;
    read(fname: string): Promise<AudioBuffer>;
    func<T0, T1, T2, T3, T4, T5, R>(fn: AnyFn<T0, T1, T2, T3, T4, T5, R>): internalNamespace.FunctionComponent<T0, T1, T2, T3, T4, T5, R>;
    bufferReader(fname: string): BufferComponent;
    bufferReader(buffer: MaybePromise<AudioBuffer>): BufferComponent;
    bufferWriter(buffer: AudioBuffer): BufferWriterComponent;
    recorder(sources: Connectable[]): AudioRecordingComponent;
    recorder(sourceAudio: Connectable): AudioRecordingComponent;
    /**
     * Allow joining ("mixing") across multiple audioContexts / threads.
     */
    join(sources: BaseConnectable[]): internalNamespace.AudioComponent;
    createThread({ name, audioContext, ...options }?: Partial<AudioConfig> & {
        name?: string;
    }): Promise<IATopLevel>;
}
