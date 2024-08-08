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
export function jit(initializer) {
    return function (target, prop) {
        initializer = initializer.bind(target);
        Object.defineProperty(target, prop, {
            get() {
                var _a;
                const secretKey = `__${prop}__`;
                return (_a = this[secretKey]) !== null && _a !== void 0 ? _a : (this[secretKey] = initializer(this, prop));
            }
        });
    };
}
console.log(A.sprop1);
console.log(A.sprop1);
const a1 = new A();
const a2 = new A();
console.log(a1);
console.log("a1" + a1.iprop1);
console.log("a1" + a1.iprop1);
console.log("a2" + a2.iprop1);
console.log("a2" + a2.iprop1);
