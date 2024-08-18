import { MaybePromise, MaybePromises } from "./types.js";
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
export declare function lazyProperty(initializer: (thisObj: any, propName?: string) => any): (target: any, prop: string) => void;
/**
 * Declare that a function's parameters may be promises, and the function will perform its action once all promises are resolved and return a promise.
 */
export declare function resolvePromiseArgs<I extends any[], O>(obj: any, propName: string, descriptor: PropertyDescriptor): TypedPropertyDescriptor<((...args: MaybePromises<I>) => MaybePromise<O>) | ((...args: I) => O)>;
