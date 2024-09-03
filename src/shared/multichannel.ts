import { MultiChannelArray, toMultiChannelArray } from "../worklet/lib/types.js"
import { MultiChannel, WebAudioConnectable } from "./types.js"

export function getNumInputChannels(node: WebAudioConnectable) {
  if (node instanceof ChannelSplitterNode) {
    return node.numberOfOutputs
  } else if (node instanceof ChannelMergerNode) {
    return node.numberOfInputs
  }
  // @ts-ignore Property undefined.
  return node['__numInputChannels'] ?? (node instanceof AudioNode ? node.channelCount : 1)
}

export function getNumOutputChannels(node: WebAudioConnectable) {
  if (node instanceof ChannelSplitterNode) {
    return node.numberOfOutputs
  } else if (node instanceof ChannelMergerNode) {
    return node.numberOfInputs
  }
  // @ts-ignore Property undefined.
  return node['__numOutputChannels']
    ?? (node instanceof AudioNode ? node.channelCount : 1)
}

export function createMultiChannelView<T extends MultiChannel>(
  multiChannelIO: T,
  supportsMultichannel: boolean
): MultiChannelArray<T> {
  let channels: T[] = []
  if (!supportsMultichannel) {
    return toMultiChannelArray(channels)
  }
  const numChannels = 'numInputChannels' in multiChannelIO ? multiChannelIO.numInputChannels : (<any>multiChannelIO).numOutputChannels
  for (let c = 0; c < numChannels; c++) {
    channels.push(createChannelView(multiChannelIO, c))
  }
  return toMultiChannelArray(channels)
}

function createChannelView<T extends MultiChannel>(
  multiChannelIO: T,
  activeChannel: number
): T {
  return new Proxy(multiChannelIO, {
    get(target, p, receiver) {
      if (p === 'activeChannel') {
        return activeChannel
      } else if (['left', 'right'].includes(String(p))) {
        return receiver
      } else if (p === 'channels') {
        return toMultiChannelArray([receiver])
      } else if (p == '_uuid') {
        return Reflect.get(target, p, receiver) + "-c" + activeChannel
      } else {
        return Reflect.get(target, p, receiver)
      }
    }
  })
}

/**
 * Call the correct WebAudio methods to connect channels.
 */
function simpleConnect(
  source: AudioNode,
  destination: WebAudioConnectable,
  fromChannel: number = 0,
  toChannel: number = 0
) {
  if (destination instanceof AudioParam) {
    return source.connect(destination, fromChannel)
  } else {
    return source.connect(destination, fromChannel, toChannel)
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
export function connectWebAudioChannels(
  audioContext: AudioContext,
  source: AudioNode,
  destination: WebAudioConnectable,
  fromChannel: number | undefined = undefined,
  toChannel: number | undefined = undefined
) {
  if (fromChannel != undefined) {
    // Source -> Splitter -> [Dest]
    // Main connection: Splitter -> Dest
    const splitter = audioContext.createChannelSplitter()
    source = source.connect(splitter)
  }
  if (toChannel != undefined) {
    // [Source] -> Merger -> Dest
    // Main connection: Source -> Merger
    const merger = audioContext.createChannelMerger()
    return source.connect(merger, fromChannel, toChannel).connect(<any>destination)
  }
  //console.log(`Connecting ${source.constructor.name} [channel=${fromChannel ?? "*"}] to ${destination} [channel=${toChannel ?? "*"}]`)
  return simpleConnect(source, destination, fromChannel, toChannel)
}
