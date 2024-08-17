import { MaybePromise, MaybePromises } from "./types.js"

/**
 * A decorator to allow properties to be computed once, only when needed.
 * 
 * Usage:
 * 
 * @example
 * class A {
 *   \@jit(Math.random)
 *   iprop1: number
 * 
 *   \@jit((_, propName) => "expensive computation of " + propName))
 *   static sprop1: number
 * }
 * 
 */
export function lazyProperty(initializer: (thisObj: any, propName?: string) => any) {
  return function (target: any, prop: string) {
    initializer = initializer.bind(target)
    Object.defineProperty(target, prop, {
      get() {
        const secretKey = `__${prop}__`
        return this[secretKey] ?? (this[secretKey] = initializer(this, prop))
      }
    })
  }
}

/**
 * Declare that a function's parameters may be promises, and the function will perform its action once all promises are resolved and return a promise.
 */
export function resolvePromiseArgs<I extends any[], O>(
  obj: any,
  propName: string,
  descriptor: PropertyDescriptor
): TypedPropertyDescriptor<
  ((...args: MaybePromises<I>) => MaybePromise<O>)
  | ((...args: I) => O)> {
  const func: (...args: I) => O = descriptor.value
  descriptor.value = function (...args: MaybePromises<I>) {
    // NOTE: 'this' within func will be unbound, but it is bound in 
    // descriptor.value. So it must be rebound.
    if (args.some(a => a instanceof Promise)) {
      // Wait for all to be resolved, then call the function.
      return Promise.all(args).then(vals => func.bind(this)(...vals))
    } else {
      return func.bind(this)(...<I>args)
    }
  }
  return descriptor
}