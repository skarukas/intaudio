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
export class MemoryBuffer {
    constructor(defaultValueFn) {
        this.defaultValueFn = defaultValueFn;
        this.circularBuffer = [];
        // offset will always be within range, and circularBuffer[offset] is the 
        // most recent value (circularBuffer[offset+1] is the one before that, etc.)
        this.offset = 0;
    }
    get length() {
        return this.circularBuffer.length;
    }
    toInnerIndex(i) {
        return (i + this.offset) % this.length;
    }
    /**
     * Get the ith value of the memory. Note that index 0 is the previous value, not 1.
     */
    get(i) {
        if (i >= this.length) {
            return this.defaultValueFn();
        }
        else {
            const innerIdx = this.toInnerIndex(i);
            return this.circularBuffer[innerIdx];
        }
    }
    /**
     * Add `val` to the array of memory, incrementing the time step. If `length` is zero, this is a no-op.
     *
     * NOTE: to add without discarding old values, always call setSize first.
     */
    add(val) {
        if (this.length) {
            const clone = JSON.parse(JSON.stringify(val)); // TODO: need this?
            // Modular subtraction by 1.
            this.offset = (this.offset + this.length - 1) % this.length;
            this.circularBuffer[this.offset] = clone;
        }
    }
    setSize(size) {
        const newBuffer = [];
        for (let i = 0; i < size; i++) {
            newBuffer.push(this.get(i));
        }
        this.circularBuffer = newBuffer;
        this.offset = 0;
    }
}
