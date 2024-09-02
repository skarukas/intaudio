import { Component } from "../../components/base/Component.js";
import { AudioSignalStream } from "../../shared/AudioSignalStream.js";
import { FFTStream } from "../../shared/FFTStream.js";
import { CanBeConnectedTo, MultiChannel } from "../../shared/types.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { AbstractOutput } from "./AbstractOutput.js";
export declare class AudioRateOutput extends AbstractOutput<number> implements MultiChannel<AudioRateOutput>, AudioSignalStream {
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
    toChannels(numChannels: number, mode?: 'speakers' | 'discrete' | 'repeat'): Component;
}
