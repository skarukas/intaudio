var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _VisualComponent_instances, _a, _VisualComponent_addBypassIndicator, _VisualComponent_assertDisplayIsUsable;
import constants from "../../shared/constants.js";
import { afterRender } from "../../shared/util.js";
import { BaseDisplay } from "../../ui/BaseDisplay.js";
import { BaseComponent } from "./BaseComponent.js";
export class VisualComponent extends BaseComponent {
    constructor() {
        super();
        _VisualComponent_instances.add(this);
        this.uniqueDomSelector = "#" + this._uuid;
    }
    static adjustSize($root) {
        const maxHeight = $root.children().get().reduce((acc, curr) => {
            var _b;
            const top = +$(curr).css('top').replace('px', '');
            const height = (_b = $(curr).outerHeight(true)) !== null && _b !== void 0 ? _b : 0;
            return Math.max(acc, top + height);
        }, 0);
        const maxWidth = $root.children().get().reduce((acc, curr) => {
            var _b;
            const left = +$(curr).css('left').replace('px', '');
            const width = (_b = $(curr).outerWidth(true)) !== null && _b !== void 0 ? _b : 0;
            return Math.max(acc, left + width);
        }, 0);
        $root.css({
            height: `${maxHeight}px`,
            width: `${maxWidth}px`
        });
    }
    static rotate($container, rotateDeg) {
        var _b, _c;
        $container.css({
            "transform-origin": "top left",
            transform: `rotate(${rotateDeg}deg)`
        });
        const parentRect = (_b = $container.parent().get(0)) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
        const rect = (_c = $container.get(0)) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect();
        if (rect == undefined || parentRect == undefined) {
            throw new Error("Both $container and its parent must exist.");
        }
        const top = +$container.css("top").replace("px", "");
        const left = +$container.css("left").replace("px", "");
        $container.css({
            top: top - rect.top + parentRect.top,
            left: left - rect.left + parentRect.left
        });
    }
    addToDom(iaRootElement, { left = 0, top = 0, width = undefined, height = undefined, rotateDeg = 0 } = {}) {
        var _b, _c;
        __classPrivateFieldGet(this, _VisualComponent_instances, "m", _VisualComponent_assertDisplayIsUsable).call(this);
        const cls = this.constructor;
        width !== null && width !== void 0 ? width : (width = (_b = cls.defaultWidth) !== null && _b !== void 0 ? _b : 0);
        height !== null && height !== void 0 ? height : (height = (_c = cls.defaultHeight) !== null && _c !== void 0 ? _c : 0);
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
            .prop('id', this._uuid);
        this.$bypassIndicator = __classPrivateFieldGet(_a, _a, "m", _VisualComponent_addBypassIndicator).call(_a, this.$container);
        this.$container.css({ width, height, top, left });
        // Main component
        const $component = this.$container;
        $component.removeClass(constants.UNINITIALIZED_CLASS);
        // Define structure.
        this.$root.append(this.$container);
        //this.$container.append($component)
        this.display._display(this.$container, width, height);
        afterRender(() => {
            _a.adjustSize(this.$root);
            _a.rotate(this.$container, rotateDeg);
        });
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
