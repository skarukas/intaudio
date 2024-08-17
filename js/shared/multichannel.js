import { toMultiChannelArray } from "../worklet/lib/types.js";
export function getNumInputChannels(node) {
    var _a;
    if (node instanceof ChannelSplitterNode) {
        return node.numberOfOutputs;
    }
    else if (node instanceof ChannelMergerNode) {
        return node.numberOfInputs;
    }
    // @ts-ignore Property undefined.
    return (_a = node['__numInputChannels']) !== null && _a !== void 0 ? _a : (node instanceof AudioNode ? node.channelCount : 1);
}
export function getNumOutputChannels(node) {
    var _a;
    if (node instanceof ChannelSplitterNode) {
        return node.numberOfOutputs;
    }
    else if (node instanceof ChannelMergerNode) {
        return node.numberOfInputs;
    }
    // @ts-ignore Property undefined.
    return (_a = node['__numOutputChannels']) !== null && _a !== void 0 ? _a : (node instanceof AudioNode ? node.channelCount : 1);
}
export function createMultiChannelView(multiChannelIO, supportsMultichannel) {
    let channels = [];
    if (!supportsMultichannel) {
        return toMultiChannelArray(channels);
    }
    const numChannels = 'numInputChannels' in multiChannelIO ? multiChannelIO.numInputChannels : multiChannelIO.numOutputChannels;
    for (let c = 0; c < numChannels; c++) {
        channels.push(createChannelView(multiChannelIO, c));
    }
    return toMultiChannelArray(channels);
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
function simpleConnect(source, destination, fromChannel = 0, toChannel = 0) {
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
    //console.log(`Connecting ${source.constructor.name} [channel=${fromChannel ?? "*"}] to ${destination} [channel=${toChannel ?? "*"}]`)
    return simpleConnect(source, destination, fromChannel, toChannel);
}
