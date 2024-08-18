export function contextPipe(
  fromContext: AudioContext,
  toContext: AudioContext
): { sink: AudioNode, source: AudioNode } {
  const mediaStreamDestination = fromContext.createMediaStreamDestination()
  const mediaStreamSource = toContext.createMediaStreamSource(mediaStreamDestination.stream)
  return {
    sink: mediaStreamDestination,
    source: mediaStreamSource,
  }
}

export function joinContexts(
  sourceContexts: AudioContext[],
  destinationContext: AudioContext
): { sinks: AudioNode[], source: AudioNode } {
  const source = destinationContext.createGain()
  const sinks = []
  for (const src of sourceContexts) {
    const { source: input, sink: output } = contextPipe(src, destinationContext)
    input.connect(source)
    sinks.push(output)
  }
  return { sinks, source }
}