/** @module BemElem
 *  @description Bem element class
 *  @since 2019.03.14, 14:39
 *  @changed 2019.03.16, 00:19
 */

const inherit = require('inherit');

const BemEntity = require('./BemEntity').default;
const { BEMDOM } = require('./BEMDOM');

/** inherit BemElem */
const BemElem = inherit(BemEntity, /** @lends BemElem.prototype */{

  __constructor: function({ ...props } = {}) {
    this.__base && this.__base.apply(this, arguments);
    const { entityClass } = props;
    if (entityClass) {
      const { elem } = entityClass;
      this.elem = elem;
    }
  },

  onInit: function() {
    // var elem = this.elem;
    var block = this.block;
    var blockEntity = this.findParentBlock(block);
    if (!blockEntity) {
      var error = new Error('Cannot find parent block');
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    // Save this block entity reference
    this.blockEntity = blockEntity;
    this.__base && this.__base();
  },

});

/*DEBUG*/ BemElem.__name = 'BemElem';

/* NOTE: Make some architecture hack (due to cyclic references)
 * TODO 2019.06.25, 13:08 -- We have the following conflict:
 *   - BemBlock uses BemEntity,
 *   - BemEntity uses BEMDOM (for findEntities, getUniqueId),
 *   - BEMDOM requires BemBlock and BemElem class prototypes to creating entities.
 * It need to be resolved.
 */
BEMDOM.BemElemProto = BemElem;

export default BemElem;
