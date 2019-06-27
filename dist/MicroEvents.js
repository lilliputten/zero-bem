"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/** @module MicroEvents
 *  @class MicroEvents
 *  @desc Minimal events manager engine
 *  @since 2019.06.06, 09:32
 *  @changed 2019.06.27, 08:27
 *
 * TODO:
 *   - 2019.06.27, 11:49 -- Tests
 *     @see:
 *       - https://github.com/psfe/micro-event/blob/master/test.js
 */
var inherit = require('inherit');

var MicroEvents = inherit(
/** @lends MicroEvents.prototype */
{
  __constructor: function __constructor() {
    this.__base && this.__base.apply(this, arguments);
    /** Event handlers storage
     * @type {Object}
     */

    this._handlers = {};
  },

  /** Low-level add handler method
   * @param {String} id
   * @param {Object] handlerData
   */
  _add: function _add(id, handlerData) {
    if (handlerData) {
      var handlers = this._handlers[id] || (this._handlers[id] = []);
      handlers.push(handlerData);
    }

    return this;
  },

  /** Add event handler
   * @param {String} id
   * @param {Function} cb
   * @param {Object} [ctx]
   * @return {Object} this
   */
  on: function on(id, cb, ctx) {
    if (typeof cb === 'function') {
      this._add(id, {
        cb: cb,
        ctx: ctx
      });
    }

    return this;
  },

  /** Add once-running event handler
   * @param {String} id
   * @param {Function} cb
   * @param {Object} [ctx]
   * @return {Object} this
   */
  once: function once(id, cb, ctx) {
    if (typeof cb === 'function') {
      this._add(id, {
        cb: cb,
        ctx: ctx,
        once: true
      });
    }

    return this;
  },

  /** Remove event handler
   * @param {String} id
   * @param {Function} cb
   * @param {Object} [ctx]
   * @return {Object} this
   */
  off: function off(id, cb, ctx) {
    var cbs = this._handlers[id];

    if (typeof cb === 'function' && Array.isArray(cbs)) {
      // Find last mathing handler
      var found = cbs.reduce(function (found, item, n) {
        // Compare cb & ctx
        if (cb == item.cb && (!ctx && !item.ctx || ctx === item.ctx)) {
          found = n;
        }

        return found;
      }, -1); // Remove if found

      if (found !== -1) {
        cbs.splice(found, 1);
      }
    }

    return this;
  },

  /** Synonym for `off`
   */
  un: function un()
  /* id, cb, ctx */
  {
    return this.off.apply(this, arguments);
  },

  /** Emit event
   * @param {String} id
   * @param {*} [args]
   * @return {Object} this
   */
  emit: function emit(id
  /* , ...args */
  ) {
    var cbs = this._handlers[id];

    if (Array.isArray(cbs) && cbs.length) {
      // Using arguments -> args
      var args = Array.from(arguments).slice(1); // Traverse in reversed oreder (if removing `once` handlers, all other stay intact)

      for (var i = cbs.length - 1; i >= 0; i--) {
        var _cbs$i = cbs[i],
            cb = _cbs$i.cb,
            ctx = _cbs$i.ctx,
            once = _cbs$i.once;

        if (typeof cb === 'function') {
          // Bind to context if specified
          var cbMethod = ctx ? cb.bind(ctx) : cb; // Apply to arguments

          cbMethod.apply(this, args); // Remove if `once`

          if (once) {
            cbs.splice(i, 1);
          }
        }
      }
    }

    return this;
  }
});
var _default = MicroEvents;
exports["default"] = _default;
//# sourceMappingURL=MicroEvents.js.map