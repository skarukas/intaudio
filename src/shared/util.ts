export function createConstantSource(audioContext: AudioContext): ConstantSourceNode {
  let src = audioContext.createConstantSource()
  src.offset.setValueAtTime(0, audioContext.currentTime)
  src.start()
  return src
}

export function isComponent(x: any): boolean {
  return !!x.isComponent
}

export function mapLikeToObject(map: any) {
  const obj = {}
  map.forEach((v, k) => obj[k] = v)
  return obj
}