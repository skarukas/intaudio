import constants from "../../shared/constants.js"
import * as init from "../../shared/init.js"
import { afterRender, scaleRange } from "../../shared/util.js";
import { BaseDisplay } from "../../ui/BaseDisplay.js"
import { BaseComponent } from "./BaseComponent.js"
declare var $: JQueryStatic;

interface NeedsDisplay<T> {
  display: NonNullable<T>
}

export abstract class VisualComponent<T extends BaseDisplay = any> extends BaseComponent implements NeedsDisplay<T> {
  static defaultWidth?: number
  static defaultHeight?: number
  /**
   * The parent element that this and other IA components are children of.
   */
  $root: JQuery<HTMLDivElement>
  /**
   * The direct parent container of the component, containing any component-independent elements.
   */
  $container: JQuery<HTMLDivElement>
  display: NonNullable<T>
  $bypassIndicator: JQuery
  /**
   * The unique DOM selector that only applies to this element.
   */
  uniqueDomSelector: string

  constructor() {
    super()
    this.uniqueDomSelector = "#" + this._uuid
  }

  static #addBypassIndicator($container: JQuery<HTMLDivElement>) {
    const $bypassIndicator = $(document.createElement('span'))
      .addClass(constants.BYPASS_INDICATOR_CLASS)
    $container.append($bypassIndicator)
    return $bypassIndicator
  }
  #assertDisplayIsUsable() {
    if (this.display == undefined || !(this.display instanceof BaseDisplay)) {
      throw new Error(`No display logic found: invalid ${this._className}.display value. Each VisualComponent must define a 'display' property of type BaseDisplay.`)
    }
    this.display.assertInitialized()
  }
  static adjustSize($root: JQuery<HTMLDivElement>) {
    const maxHeight = $root.children().get().reduce((acc, curr) => {
      const top = +$(curr).css('top').replace('px', '')
      const height = $(curr).outerHeight(true)
      return Math.max(acc, top + height)
    }, 0);
    const maxWidth = $root.children().get().reduce((acc, curr) => {
      const left = +$(curr).css('left').replace('px', '')
      const width = $(curr).outerWidth(true)
      return Math.max(acc, left + width)
    }, 0);
    $root.css({
      height: `${maxHeight}px`,
      width: `${maxWidth}px`
    });
  }
  static rotate($container: JQuery, rotateDeg: number) {
    $container.css({
      "transform-origin": "top left",
      transform: `rotate(${rotateDeg}deg)`
    })
    const parentRect = $container.parent().get(0).getBoundingClientRect()
    const top = +$container.css("top").replace("px", "")
    const left = +$container.css("left").replace("px", "")
    const rect = $container.get(0).getBoundingClientRect()
    $container.css({
      top: top - rect.top + parentRect.top,
      left: left - rect.left + parentRect.left
    })
  }
  addToDom(
    iaRootElement,
    { left = 0, top = 0, width = undefined, height = undefined, rotateDeg = 0 }:
      { left?: number, top?: number, width?: number, height?: number, rotateDeg?: number } = {}) {
    this.#assertDisplayIsUsable()
    const cls = <typeof VisualComponent>this.constructor
    width ??= cls.defaultWidth
    height ??= cls.defaultHeight
    // Root.
    this.$root = $(iaRootElement).addClass('ia-root')
    if (!this.$root.length) {
      throw new Error(`No element found for ${iaRootElement}.`)
    }

    // Container.
    this.$container = $(document.createElement('div'))
    this.$container
      .addClass(constants.COMPONENT_CONTAINER_CLASS)
      .addClass(`ia-${this._className}`)
      .attr('title', `${this._className} (#${this._uuid})`)
      .addClass('component')
      .addClass(constants.UNINITIALIZED_CLASS)
      .prop('id', this._uuid)
    this.$bypassIndicator = VisualComponent.#addBypassIndicator(this.$container)
    this.$container.css({ width, height, top, left })

    // Main component
    const $component = this.$container
    init.run(() => $component.removeClass(constants.UNINITIALIZED_CLASS))

    // Define structure.
    this.$root.append(this.$container)
    //this.$container.append($component)
    this.display._display(this.$container, width, height)
    afterRender(() => {
      VisualComponent.adjustSize(this.$root)
      VisualComponent.rotate(this.$container, rotateDeg)
    })
    return $component
  }
  refreshDom() {
    throw new Error("TODO: Remove refreshDom. Individual methods should be written instead.")
    this.#assertDisplayIsUsable()
    if (this.$container) {
      this.display._refreshDisplay(undefined, undefined)
    }
  }
  onMuteEvent(event) {
    if (this.$container) {
      if (event.shouldMute) {
        this.$container.addClass(constants.MUTED_CLASS)
      } else {
        this.$container.removeClass(constants.MUTED_CLASS)
      }
    }
  }
  onBypassEvent(event) {
    if (this.$container) {
      if (event.shouldBypass) {
        this.$container.addClass(constants.BYPASSED_CLASS)
        this.$bypassIndicator?.show()
      } else {
        this.$container.removeClass(constants.BYPASSED_CLASS)
        this.$bypassIndicator?.hide()
      }
    }
  }
}