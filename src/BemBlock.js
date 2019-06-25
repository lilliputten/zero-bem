/** @module BemBlock
 *  @description Bem block class
 *  @since 2019.03.09, 22:54
 *  @changed 2019.03.16, 00:19
 */

const inherit = require('inherit');
const BemEntity = require('./BemEntity').default;
const { BEMDOM } = require('./BEMDOM');

/** inherit BemBlock */
const BemBlock = inherit(BemEntity, /** @lends BemBlock.prototype */{

  __constructor: function(/* { params, ...props } = {} */) {
    this.__base && this.__base.apply(this, arguments);
  },

});

/*DEBUG*/ BemBlock.__name = 'BemBlock';

/* NOTE: Make some architecture hack (due to cyclic references)
 * TODO 2019.06.25, 13:08 -- We have the following conflict:
 *   - BemBlock uses BemEntity,
 *   - BemEntity uses BEMDOM (for findEntities, getUniqueId),
 *   - BEMDOM requires BemBlock and BemElem class prototypes to creating entities.
 * It need to be resolved.
 */
BEMDOM.BemBlockProto = BemBlock;

export default BemBlock;
