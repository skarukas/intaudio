import { Constructor } from "../shared/types.js"

export interface HasTypeValidator {
  /**
   * The validator function can either throw an error or return false.
   */
  withValidator(validatorFn: (v: any) => boolean | void): this;
  ofType(type: Constructor | string): this;
}