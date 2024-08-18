import { MultiChannelArray } from "../worklet/lib/types.js";
import { MultiChannel, WebAudioConnectable } from "./types.js";
export declare function getNumInputChannels(node: WebAudioConnectable): any;
export declare function getNumOutputChannels(node: WebAudioConnectable): any;
export declare function createMultiChannelView<T extends MultiChannel>(multiChannelIO: T, supportsMultichannel: boolean): MultiChannelArray<T>;
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
export declare function connectWebAudioChannels(audioContext: AudioContext, source: AudioNode, destination: WebAudioConnectable, fromChannel?: number | undefined, toChannel?: number | undefined): void | AudioNode;
