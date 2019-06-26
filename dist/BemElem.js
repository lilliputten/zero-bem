"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/** @module BemElem
 *  @description Bem element class
 *  @since 2019.03.14, 14:39
 *  @changed 2019.03.16, 00:19
 */
var inherit = require('inherit');

var BemEntity = require('./BemEntity')["default"];

var _require = require('./BEMDOM'),
    BEMDOM = _require.BEMDOM;
/** inherit BemElem */


var BemElem = inherit(BemEntity,
/** @lends BemElem.prototype */
{
  __constructor: function __constructor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        props = _extends({}, _ref);

    this.__base && this.__base.apply(this, arguments);
    var entityClass = props.entityClass;

    if (entityClass) {
      var elem = entityClass.elem;
      this.elem = elem;
    }
  },
  onInit: function onInit() {
    // var elem = this.elem;
    var block = this.block;
    var blockEntity = this.findParentBlock(block);

    if (!blockEntity) {
      var error = new Error('Cannot find parent block');
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    } // Save this block entity reference


    this.blockEntity = blockEntity;
    this.__base && this.__base();
  }
});
/*DEBUG*/

BemElem.__name = 'BemElem';
/* NOTE: Make some architecture hack (due to cyclic references)
 * TODO 2019.06.25, 13:08 -- We have the following conflict:
 *   - BemBlock uses BemEntity,
 *   - BemEntity uses BEMDOM (for findEntities, getUniqueId),
 *   - BEMDOM requires BemBlock and BemElem class prototypes to creating entities.
 * It need to be resolved.
 */

BEMDOM.BemElemProto = BemElem;
var _default = BemElem;
exports["default"] = _default;
//# sourceMappingURL=BemElem.js.map