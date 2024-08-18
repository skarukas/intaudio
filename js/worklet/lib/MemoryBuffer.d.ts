/**
 * A data structure storing the last N values in a time series.
 *
 * It is implemented as a circular array to avoid processing when the time step
 * is incremented.
 *
 * Here's a demonstration with eaach t[n] being an absolute time, | showing
 * the position of the offset, and _ being the default value.
 *
 * "Initial" state storing the first 4 values:
 * - circularBuffer: [|v3 v2 v1 v0]
 * - offset: 0
 *
 * > get(0) = v3
 * > get(1) = v2
 * > get(4) = _
 *
 * After add(v4):
 * - circularBuffer: [v3 v2 v1 | v4]
 * - offset: 3
 *
 * > get(0) = v4
 * > get(1) = v3
 *
 * After setSize(8):
 * - circularBuffer: [|v4 v3 v2 v1 _ _ _ _]
 * - offset: 0
 *
 */
export declare class MemoryBuffer<T> {
    defaultValueFn: (() => T);
    protected circularBuffer: T[];
    protected offset: number;
    constructor(defaultValueFn: (() => T));
    get length(): number;
    protected toInnerIndex(i: number): number;
    /**
     * Get the ith value of the memory. Note that index 0 is the previous value, not 1.
     */
    get(i: number): T;
    /**
     * Add `val` to the array of memory, incrementing the time step. If `length` is zero, this is a no-op.
     *
     * NOTE: to add without discarding old values, always call setSize first.
     */
    add(val: T): void;
    setSize(size: number): void;
}
