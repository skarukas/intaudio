import { TypedStreamSpec } from "../../shared/StreamSpec.js";
import { ObjectOf } from "../../shared/types.js";
import { ArrayLike, AudioDimension, SignalProcessingFnInput } from "./types.js";
type RawChannelFrame<D extends AudioDimension> = {
    audioStreams: ArrayLike<SignalProcessingFnInput<D>>;
    parameters?: {
        [id: string]: any;
    };
};
export declare abstract class IODatatype<Channel = any> {
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
type STFTData = {
    magnitude: ArrayLike<number>;
    phase: ArrayLike<number>;
};
export declare class stft extends IODatatype<STFTData> {
    windowSize?: number | undefined;
    dataspecString: string;
    numAudioStreams: number;
    constructor(windowSize?: number | undefined);
    channelFromAudioData(frame: RawChannelFrame<"channels">): STFTData;
    __NEW__validateAny<D extends AudioDimension>(value: {
        magnitude: SignalProcessingFnInput<D>;
        phase: SignalProcessingFnInput<D>;
    }): boolean;
    __NEW__toAudioData<D extends AudioDimension>(value: {
        magnitude: SignalProcessingFnInput<D>;
        phase: SignalProcessingFnInput<D>;
    }, sampleIndex?: number): RawChannelFrame<D>;
    __OLD__validate(value: STFTData, { checkLength }: {
        checkLength: boolean;
    }): void;
    __OLD__channelToAudioData(value: STFTData): RawChannelFrame<"channels">;
}
export declare class audio extends IODatatype<ArrayLike<number>> {
    dataspecString: string;
    __NEW__validateAny<D>(value: SignalProcessingFnInput<D>): boolean;
    __NEW__toAudioData<D extends AudioDimension>(value: SignalProcessingFnInput<D>, sampleIndex?: number): RawChannelFrame<D>;
    __OLD__validate(channel: ArrayLike<number>): void;
    numAudioStreams: number;
    channelFromAudioData(frame: RawChannelFrame<"channels">): ArrayLike<number>;
    __OLD__channelToAudioData(channel: ArrayLike<number>): RawChannelFrame<"channels">;
}
export declare class control extends IODatatype {
    parameterKey: string | number;
    dataspecString: string;
    __NEW__validateAny(value: any): boolean;
    __NEW__toAudioData<D extends AudioDimension>(value: any, sampleIndex?: number): RawChannelFrame<D>;
    __OLD__validate(value: any): void;
    numAudioStreams: number;
    constructor(parameterKey: string | number);
    channelFromAudioData(frame: RawChannelFrame<"channels">): any;
    __OLD__channelToAudioData(value: any): RawChannelFrame<"channels">;
}
/**
 * Converts a frame of audio data + metadata to and from function I/O types exposed to the user-defined function. The frame may be of any dimension.
 */
export declare class FrameToSignatureConverter<D extends AudioDimension> {
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
export {};
