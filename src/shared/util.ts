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

/**
 * Scale a value to a new range.
 * 
 * @param v The value to scale, where `inMin <= v <= inMax`.
 * @param inputRange An array `[inMin, inMax]` specifying the range the input comes from.
 * @param outputRange An array `[outMin, outMax]` specifying the desired range  of the output.
 * @returns A scaled value `x: outMin <= x <= outMax`.
 */
export function scaleRange(
  v: number, 
 [inMin, inMax]: number[],
 [outMin, outMax]: number[]
): number {
  const zeroOneScaled = (v - inMin) / (inMax - inMin)
  return zeroOneScaled * (outMax - outMin) + outMin
}