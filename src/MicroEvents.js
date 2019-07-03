/** @module MicroEvents
 *  @class MicroEvents
 *  @desc Minimal events manager engine
 *  @since 2019.06.06, 09:32
 *  @changed 2019.06.27, 08:27
 *
 * TODO:
 *   - Synthetic events creation?
 */

const inherit = require('inherit');

const MicroEvents = inherit( /** @lends MicroEvents.prototype */ {

  __constructor: function() {

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
  _add: function(id, handlerData) {
    if (handlerData) {
      const handlers = this._handlers[id] || (this._handlers[id] = []);
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
  on: function(id, cb, ctx) {
    if (typeof cb === 'function') {
      this._add(id, { cb, ctx });
    }
    return this;
  },

  /** Add once-running event handler
   * @param {String} id
   * @param {Function} cb
   * @param {Object} [ctx]
   * @return {Object} this
   */
  once: function(id, cb, ctx) {
    if (typeof cb === 'function') {
      this._add(id, { cb, ctx, once: true });
    }
    return this;
  },

  /** Remove event handler
   * @param {String} id
   * @param {Function} cb
   * @param {Object} [ctx]
   * @return {Object} this
   */
  off: function(id, cb, ctx) {
    const handlers = this._handlers;
    const cbs = handlers[id];
    if (typeof cb === 'function' && Array.isArray(cbs)) {
      // Find last mathing handler
      const found = cbs.reduce((found, item, n) => {
        // Compare cb & ctx
        if (cb == item.cb && ((!ctx && !item.ctx) || ctx === item.ctx)) {
          found = n;
        }
        return found;
      }, -1);
      // Remove if found
      if (found !== -1) {
        cbs.splice(found, 1);
      }
    }
    // If passed only id then clean all handlers for this id
    else if (arguments.length === 1 && cbs) {
      cbs.splice(0);
    }
    // If nothing passed then clean all handlers for all ids
    else if (arguments.length === 0) {
      // Method 1: Create brand new empty handlers storage
      // this._handlers = {};
      // Method 2: Reset each handlers list to empty array
      // Object.values(handlers).forEach((cbs) => {
      //   cbs.splice(0);
      // });
      // Method 3: Remove all handler array entries
      Object.keys(handlers).forEach((id) => {
        delete handlers[id];
      });
    }
    return this;
  },

  /** Synonym for `off`
   */
  un: function(/* id, cb, ctx */) {
    return this.off.apply(this, arguments);
  },

  /** Emit event
   * @param {String} id
   * @param {*} [args]
   * @return {Object} this
   */
  emit: function(id/* , ...args */) {
    const cbs = this._handlers[id];
    if (Array.isArray(cbs) && cbs.length) {
      // Using arguments -> args
      const args = Array.from(arguments).slice(1);
      // Traverse in reversed oreder (if removing `once` handlers, all other stay intact)
      for (let i = cbs.length - 1; i >= 0; i--) {
        const { cb, ctx, once } = cbs[i];
        if (typeof cb === 'function') {
          // Bind to context if specified
          const cbMethod = (ctx) ? cb.bind(ctx) : cb;
          // Apply to arguments
          cbMethod.apply(this, args);
          // Remove if `once`
          if (once) {
            cbs.splice(i, 1);
          }
        }
      }
    }
    return this;
  },

});

export default MicroEvents;
