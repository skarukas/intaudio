/**
 * Call the correct WebAudio methods to connect the selected channels, if any.
 *
 * @param source
 * @param destination
 * @param fromChannel
 * @param toChannel
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
