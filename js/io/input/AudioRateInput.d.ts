import { Component } from "../../components/base/Component.js";
import { AbstractInput } from "./AbstractInput.js";
import constants from "../../shared/constants.js";
import { MultiChannel, WebAudioConnectable } from "../../shared/types.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
export declare class AudioRateInput extends AbstractInput<number> implements MultiChannel<AudioRateInput> {
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
    setValue(value: number | typeof constants.TRIGGER): void;
}
