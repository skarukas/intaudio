import { BaseComponent } from "../components/base/BaseComponent.js";
export function createMultiChannelView(multiChannelIO, node) {
    let channels = [];
    if (!(node instanceof AudioNode)) {
        return channels;
    }
    for (let c = 0; c < node.channelCount; c++) {
        channels.push(createChannelView(multiChannelIO, c));
    }
    return channels;
}
function createChannelView(multiChannelIO, activeChannel) {
    return new Proxy(multiChannelIO, {
        get(target, p, receiver) {
            if (p === 'activeChannel') {
                return activeChannel;
            }
            else if (['channels', 'left', 'right'].includes(String(p))) {
                throw new Error(`Forbidden property: '${String(p)}'. A channel view stores only a single channel.`);
            }
            else {
                return Reflect.get(target, p, receiver);
            }
        }
    });
}
/**
 * Call the correct WebAudio methods to connect channels.
 */
function simpleConnect(source, destination, fromChannel = undefined, toChannel = undefined) {
    if (destination instanceof AudioParam) {
        return source.connect(destination, fromChannel);
    }
    else {
        return source.connect(destination, fromChannel, toChannel);
    }
}
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
export function connectWebAudioChannels(audioContext, source, destination, fromChannel = undefined, toChannel = undefined) {
    console.log([source, destination, fromChannel, toChannel]);
    if (fromChannel != undefined) {
        // Source -> Splitter -> [Dest]
        // Main connection: Splitter -> Dest
        const splitter = audioContext.createChannelSplitter();
        source = source.connect(splitter);
    }
    if (toChannel != undefined) {
        // [Source] -> Merger -> Dest
        // Main connection: Source -> Merger
        const merger = audioContext.createChannelMerger();
        return source.connect(merger, fromChannel, toChannel).connect(destination);
    }
    return simpleConnect(source, destination, fromChannel, toChannel);
}
/*
export function connectIO(
  output: AudioRateOutput | HybridOutput,
  input: AudioRateInput | HybridInput<number>,
) {
  if (output.activeChannels) {
    if (input.activeChannels.length == 1) {
      for (const c of output.activeChannels) {
        output.splitter.connect(input.merger, c, c)
      }
    } else if (input.activeChannels.length > 1) {
      // Connect as many as we can.
      const numChannels = Math.min(input.activeChannels.length, output.activeChannels.length)
      for (let i = 0; i < numChannels; i++) {
        output.splitter.connect(
          input.merger,
          input.activeChannels[i],
          output.activeChannels[i]
        )
      }
    } else {
      for (const c of output.activeChannels) {
        output.splitter.connect(input.audioSink, c, 0)
      }
    }
  } else {
    if (input.activeChannels) {
      for (const c of input.activeChannels) {
        output.audioNode.connect(input.merger, c, c)
      }
    } else {
      for (const c of output.activeChannels) {
        output.splitter.connect(input.audioSink, c, 0)
      }
    }
  }
} */
// TODO: factor out to new file.
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
