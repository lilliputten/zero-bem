"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/** @module BemBlock
 *  @description Bem block class
 *  @since 2019.03.09, 22:54
 *  @changed 2019.03.16, 00:19
 */
var inherit = require('inherit');

var BemEntity = require('./BemEntity')["default"];

var _require = require('./BEMDOM'),
    BEMDOM = _require.BEMDOM;
/** inherit BemBlock */


var BemBlock = inherit(BemEntity,
/** @lends BemBlock.prototype */
{
  __constructor: function __constructor()
  /* { params, ...props } = {} */
  {
    this.__base && this.__base.apply(this, arguments);
  }
});
/*DEBUG*/

BemBlock.__name = 'BemBlock';
/* NOTE: Make some architecture hack (due to cyclic references)
 * TODO 2019.06.25, 13:08 -- We have the following conflict:
 *   - BemBlock uses BemEntity,
 *   - BemEntity uses BEMDOM (for findEntities, getUniqueId),
 *   - BEMDOM requires BemBlock and BemElem class prototypes to creating entities.
 * It need to be resolved.
 */

BEMDOM.BemBlockProto = BemBlock;
var _default = BemBlock;
exports["default"] = _default;
//# sourceMappingURL=BemBlock.js.map