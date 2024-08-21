import { Component } from "./components/base/Component.js";
import { MaybePromise, ObjectOf, ObjectOrArrayOf, TimeMeasure } from "./shared/types.js";
import { Connectable } from "./shared/base/Connectable.js";
import { AudioRecordingComponent } from "./components/AudioRecordingComponent.js";
import { BufferWriterComponent } from "./components/BufferWriterComponent.js";
import { AudioConfig } from "./shared/config.js";
import { BufferComponent } from "./components/BufferComponent.js";
import { BaseConnectable } from "./shared/base/BaseConnectable.js";
import { AudioRateInput } from "./io/input/AudioRateInput.js";
import * as internalNamespace from './internals.js';
export declare class IATopLevel {
    config: AudioConfig;
    internals: typeof internalNamespace;
    out: AudioRateInput;
    util: typeof internalNamespace.util;
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
    stackChannels(inputs: Connectable[]): internalNamespace.ChannelStacker;
    generate(fn: (t: number) => number, timeMeasure?: TimeMeasure): internalNamespace.TimeVaryingSignal;
    combine(inputs: Connectable[] | ObjectOf<Connectable>, fn: Function, options?: {}): Component;
    bundle(inputs: ObjectOrArrayOf<Component>): internalNamespace.BundleComponent<ObjectOf<Component<internalNamespace.AnyInput, internalNamespace.AnyOutput>>>;
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
    join(sources: BaseConnectable[]): internalNamespace.AudioComponent;
    createThread({ name, audioContext, ...options }?: Partial<AudioConfig> & {
        name?: string;
    }): Promise<IATopLevel>;
}
