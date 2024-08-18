import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class ChannelSplitter extends BaseComponent implements Iterable<AudioRateOutput> {
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
