export function contextPipe(fromContext, toContext) {
    const mediaStreamDestination = fromContext.createMediaStreamDestination();
    const mediaStreamSource = toContext.createMediaStreamSource(mediaStreamDestination.stream);
    return {
        sink: mediaStreamDestination,
        source: mediaStreamSource,
    };
}
export function joinContexts(sourceContexts, destinationContext) {
    const source = destinationContext.createGain();
    const sinks = [];
    for (const src of sourceContexts) {
        const { source: input, sink: output } = contextPipe(src, destinationContext);
        input.connect(source);
        sinks.push(output);
    }
    return { sinks, source };
}
