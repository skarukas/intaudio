import { BaseComponent } from "./base/BaseComponent.js";
export class ChannelSplitter extends BaseComponent {
    constructor(...inputChannelGroups) {
        super();
        this.outputChannels = [];
        this.length = inputChannelGroups.length;
        this.splitter = this.audioContext.createChannelSplitter();
        this.input = this.defineAudioInput('input', this.splitter);
        this.createMergedOutputs(inputChannelGroups);
    }
    createMergedOutputs(inputChannelGroups) {
        if (inputChannelGroups.length > 32) {
            throw new Error("Can only split into 32 or fewer channels.");
        }
        for (let i = 0; i < inputChannelGroups.length; i++) {
            const mergedNode = this.mergeChannels(inputChannelGroups[i]);
            this[i] = this.defineAudioOutput("" + i, mergedNode);
            this.outputChannels.push(this[i]);
        }
    }
    mergeChannels(channels) {
        const merger = this.audioContext.createChannelMerger(channels.length);
        for (let c = 0; c < channels.length; c++) {
            // The N input channels of the merger will contain the selected output
            // channels of the splitter.
            this.splitter.connect(merger, channels[c], c);
        }
        return merger;
    }
    [Symbol.iterator]() {
        let index = 0;
        const items = this.outputChannels;
        return {
            next() {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                }
                else {
                    return { value: 0, done: true };
                }
            },
        };
    }
}
