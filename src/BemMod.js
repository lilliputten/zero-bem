/** @module BemMod
 *  @description Bem block class
 *  @since 2019.03.09, 22:54
 *  @changed 2019.03.16, 00:19
 */

const inherit = require('inherit');

const BemEntity = require('./BemEntity').default;

// TODO?
const BemMod = inherit(BemEntity, /** @lends BemMod.prototype */{});

export default BemMod;
