/** @module zero-bem
 *  @description zero-bem library index
 *  @since 2019.03.16, 00:05
 *  @changed 2019.06.26, 15:31
 */

const { BEMHTML } = require('../BEMHTML/BEMHTML');

const { BEMDOM } = require('./BEMDOM');

const { config } = require('./config');
const { utils } = require('./utils');

// const Events = require('./MicroEvents').default;

const BemEntity = require('./BemEntity').default;
const BemBlock = require('./BemBlock').default;
const BemElem = require('./BemElem').default;
const BemMod = require('./BemMod').default;

export {

  config,
  utils,

  // Events,

  BEMDOM,
  BEMHTML,

  BemEntity,
  BemBlock,
  BemElem,
  BemMod,

};
