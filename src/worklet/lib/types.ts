export type AudioDimension = "all" | "none" | "channels" | "time"
export type MultiChannelArray<T> = T[] & { get left(): T, get right(): T }
export type ArrayLike<T> = { length: number, [idx: number]: T }
export type SignalProcessingFnInput<D> = (
  D extends "all" ? MultiChannelArray<ArrayLike<number>>
  : (
    D extends "channels" ? MultiChannelArray<number>
    : (
      D extends "time" ? ArrayLike<number> : number
    )
  )
)

export function toMultiChannelArray<T>(array: T[]): MultiChannelArray<T> {
  const proxy = new Proxy(array, {
    get(target, p, receiver) {
      if (p == "left") return target[0]
      if (p == "right") return target[1]
      return Reflect.get(target, p, receiver)
    }
  })
  return <MultiChannelArray<T>>proxy
}