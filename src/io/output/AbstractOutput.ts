import { BaseConnectable } from "../../shared/base/BaseConnectable.js"

export abstract class AbstractOutput<T = any> extends BaseConnectable {
  constructor(public name: string) {
    super()
  }
  connections = []
  callbacks: Array<(val?: T) => void> = []
}