/** @module Demo
 *  @since 2019.06.26, 14:31
 *  @changed 2019.06.26, 14:31
 */

const { BEMDOM } = require('zero-bem');

require('./Demo.bemhtml');
require('./Demo.pcss');

const Demo_proto = /** @lends Demo.prototype */ {

  /** Initialize the component event handler
   */
  onInit: function() {

    this.__base();

    console.log('Demo:onInit: params', this.params); // eslint-disable-line no-console

    // Emit demo event
    setTimeout(() => {
      this.emit('demoEvent', { ok: true });
    }, 1000);

  },

};

export default BEMDOM.declBlock('Demo', Demo_proto);
