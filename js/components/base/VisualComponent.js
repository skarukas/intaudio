var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _VisualComponent_instances, _a, _VisualComponent_addBypassIndicator, _VisualComponent_assertDisplayIsUsable;
import constants from "../../shared/constants.js";
import * as init from "../../shared/init.js";
import { BaseDisplay } from "../../ui/BaseDisplay.js";
import { BaseComponent } from "./BaseComponent.js";
export class VisualComponent extends BaseComponent {
    constructor() {
        super();
        _VisualComponent_instances.add(this);
        this.domId = this._uuid;
    }
    static adjustSize($root) {
        const maxHeight = $root.children().get().reduce((acc, curr) => {
            const top = +$(curr).css('top').replace('px', '');
            const height = $(curr).outerHeight(true);
            return Math.max(acc, top + height);
        }, 0);
        const maxWidth = $root.children().get().reduce((acc, curr) => {
            const left = +$(curr).css('left').replace('px', '');
            const width = $(curr).outerWidth(true);
            return Math.max(acc, left + width);
        }, 0);
        $root.css({
            height: `${maxHeight}px`,
            width: `${maxWidth}px`
        });
    }
    addToDom(iaRootElement, { left = 0, top = 0, width = undefined, height = undefined } = {}) {
        __classPrivateFieldGet(this, _VisualComponent_instances, "m", _VisualComponent_assertDisplayIsUsable).call(this);
        const cls = this.constructor;
        width !== null && width !== void 0 ? width : (width = cls.defaultWidth);
        height !== null && height !== void 0 ? height : (height = cls.defaultHeight);
        // Root.
        this.$root = $(iaRootElement).addClass('ia-root');
        if (!this.$root.length) {
            throw new Error(`No element found for ${iaRootElement}.`);
        }
        // Container.
        this.$container = $(document.createElement('div'));
        this.$container
            .addClass(constants.COMPONENT_CONTAINER_CLASS)
            .addClass(`ia-${this._className}`)
            .attr('title', `${this._className} (#${this._uuid})`)
            .addClass('component')
            .addClass(constants.UNINITIALIZED_CLASS)
            .prop('id', this.domId);
        this.$bypassIndicator = __classPrivateFieldGet(_a, _a, "m", _VisualComponent_addBypassIndicator).call(_a, this.$container);
        this.$container.css({ width, height, top, left });
        // Main component
        const $component = this.$container;
        init.run(() => $component.removeClass(constants.UNINITIALIZED_CLASS));
        // Define structure.
        this.$root.append(this.$container);
        //this.$container.append($component)
        this.display._display(this.$container, width, height);
        _a.adjustSize(this.$root);
        return $component;
    }
    refreshDom() {
        throw new Error("TODO: Remove refreshDom. Individual methods should be written instead.");
        __classPrivateFieldGet(this, _VisualComponent_instances, "m", _VisualComponent_assertDisplayIsUsable).call(this);
        if (this.$container) {
            this.display._refreshDisplay(undefined, undefined);
        }
    }
    onMuteEvent(event) {
        if (this.$container) {
            if (event.shouldMute) {
                this.$container.addClass(constants.MUTED_CLASS);
            }
            else {
                this.$container.removeClass(constants.MUTED_CLASS);
            }
        }
    }
    onBypassEvent(event) {
        var _b, _c;
        if (this.$container) {
            if (event.shouldBypass) {
                this.$container.addClass(constants.BYPASSED_CLASS);
                (_b = this.$bypassIndicator) === null || _b === void 0 ? void 0 : _b.show();
            }
            else {
                this.$container.removeClass(constants.BYPASSED_CLASS);
                (_c = this.$bypassIndicator) === null || _c === void 0 ? void 0 : _c.hide();
            }
        }
    }
}
_a = VisualComponent, _VisualComponent_instances = new WeakSet(), _VisualComponent_addBypassIndicator = function _VisualComponent_addBypassIndicator($container) {
    const $bypassIndicator = $(document.createElement('span'))
        .addClass(constants.BYPASS_INDICATOR_CLASS);
    $container.append($bypassIndicator);
    return $bypassIndicator;
}, _VisualComponent_assertDisplayIsUsable = function _VisualComponent_assertDisplayIsUsable() {
    if (this.display == undefined || !(this.display instanceof BaseDisplay)) {
        throw new Error(`No display logic found: invalid ${this._className}.display value. Each VisualComponent must define a 'display' property of type BaseDisplay.`);
    }
    this.display.assertInitialized();
};
