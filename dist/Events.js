"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/** @module Events
 *  @description Events
 *  @since 2019.04.01, 16:22
 *  @changed 2019.06.11, 10:26
 */
// require('lib/polyfills');
// - http://kawanet.github.io/event-lite/EventLite.html
// - https://www.npmjs.com/package/event-lite
var LiteEvents = require('event-lite'); // Extends LiteEvents...


var Events = function Events() {
  LiteEvents.call(this);
};

Events.prototype = Object.create(LiteEvents.prototype);
Events.prototype.constructor = Events; // Adding context props

/** Add event handler
 * @param {string} id - Event id
 * @param {function} func - Handler function
 * @param {object} [ctx] - Context for func
 * @return {Events} Self for method chaining
 */

Events.prototype._on = Events.prototype.on; // Store original method

Events.prototype.on = function (id, func, ctx) {
  if (!func) {
    var error = new Error('Events: callback must be a function');
    console.error('Events:on: error', error); // eslint-disable-line no-console

    /*DEBUG*/

    debugger; // eslint-disable-line no-debugger

    throw error;
  }

  if (typeof func === 'function' && ctx) {
    func = func.bind(ctx);
  }

  return this._on(id, func);
};
/** Add once-calling event handler
 * @param {string} id - Event id
 * @param {function} func - Handler function
 * @param {object} [ctx] - Context for func
 * @return {Events} Self for method chaining
 */


Events.prototype._once = Events.prototype.once; // Store original method

Events.prototype.once = function (id, func, ctx) {
  if (!func) {
    var error = new Error('Events: callback must be a function');
    console.error('Events:once: error', error); // eslint-disable-line no-console

    /*DEBUG*/

    debugger; // eslint-disable-line no-debugger

    throw error;
  }

  if (typeof func === 'function' && ctx) {
    func = func.bind(ctx);
  }

  return this._once(id, func);
};
/** Remove event handler
 * @param {string} [id] - Event id
 * @param {function} [func] - Handler function
 * @param {object} [ctx] - Context for func
 * @return {Events} Self for method chaining
 */


Events.prototype._off = Events.prototype.off; // Store original method

Events.prototype.off = function (id, func, ctx) {
  if (!func) {
    var error = new Error('Events: callback must be a function');
    console.error('Events:on: error', error); // eslint-disable-line no-console

    /*DEBUG*/

    debugger; // eslint-disable-line no-debugger

    throw error;
  }

  if (typeof func === 'function' && ctx) {
    func = func.bind(ctx);
  }

  return this._off(id, func);
};

Events.prototype.un = Events.prototype.off; // Syn

var _default = Events;
exports["default"] = _default;
//# sourceMappingURL=Events.js.map