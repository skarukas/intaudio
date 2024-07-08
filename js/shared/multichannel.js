import { AbstractInput } from "../io/input/AbstractInput.js";
export function getNumInputChannels(node) {
    var _a;
    if (node instanceof ChannelMergerNode) {
        return node.numberOfInputs;
    }
    else if (node instanceof ScriptProcessorNode) {
        return (_a = node['__numInputChannels']) !== null && _a !== void 0 ? _a : node.channelCount;
    }
    return node instanceof AudioNode ? node.channelCount : 1;
}
export function getNumOutputChannels(node) {
    var _a;
    if (node instanceof ChannelSplitterNode) {
        return node.numberOfOutputs;
    }
    else if (node instanceof ScriptProcessorNode) {
        return (_a = node['__numOutputChannels']) !== null && _a !== void 0 ? _a : node.channelCount;
    }
    return node instanceof AudioNode ? node.channelCount : 1;
}
export function createMultiChannelView(multiChannelIO, node) {
    let channels = [];
    if (!(node instanceof AudioNode)) {
        return channels;
    }
    const numChannels = multiChannelIO instanceof AbstractInput ? getNumInputChannels(node) : getNumOutputChannels(node);
    for (let c = 0; c < numChannels; c++) {
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
class OldMultiChannelView extends Array {
    get left() {
        return this[0];
    }
    get right() {
        return this[1];
    }
}
export function toMultiChannelArray(array) {
    Object.defineProperties(array, {
        left: {
            get: function () {
                return this[0];
            }
        },
        right: {
            get: function () {
                return this[1];
            }
        }
    });
    return array;
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
