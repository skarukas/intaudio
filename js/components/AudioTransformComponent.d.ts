import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { Connectable } from "../shared/base/Connectable.js";
import { ToStringAndUUID } from "../shared/base/ToStringAndUUID.js";
import { StreamSpec } from "../shared/StreamSpec.js";
import { SignalProcessingContextFactory } from "../worklet/lib/SignalProcessingContextFactory.js";
import { AudioDimension } from "../worklet/lib/types.js";
import { MappingFn } from "../worklet/lib/utils.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare abstract class AudioExecutionContext<D extends AudioDimension> extends ToStringAndUUID {
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
export declare class WorkletExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
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
export declare class ScriptProcessorExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
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
export declare class AudioTransformComponent<D extends AudioDimension = "none"> extends BaseComponent {
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
