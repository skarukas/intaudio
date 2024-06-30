import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import constants from "../shared/constants.js"
import { BangDisplay } from "../ui/BangDisplay.js"
import { VisualComponent } from "./base/VisualComponent.js"

export class Bang extends VisualComponent<BangDisplay> {
  readonly output: ControlOutput<typeof constants.TRIGGER>
  // Display options. TODO: move to display class?
  static defaultHeight = 48;
  static defaultWidth = 48;
  
  constructor() {
    super()
    this.display = new this._.BangDisplay(this)
    this.output = this._defineControlOutput('output')
    this._preventIOOverwrites()
  }

  connect(destination) {
    let { component } = this.getDestinationInfo(destination)
    if (destination instanceof ControlInput) {
      this.output.connect(destination)
    } else {
      this.output.connect(component.triggerInput)
    }
    return component
  }
  trigger() {
    this.output.setValue(constants.TRIGGER)
  }
}