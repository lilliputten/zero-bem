/** @module nano-bem
 *  @description nano-bem library index
 *  @since 2019.03.16, 00:05
 *  @changed 2019.06.25, 11:44
 */

const { BEMHTML } = require('./BEMHTML/BEMHTML');

const { BEMDOM } = require('./src/BEMDOM');

const { config } = require('./src/config');
const { utils } = require('./src/utils');

const Events = require('./src/Events').default;

const BemEntity = require('./src/BemEntity').default;
const BemBlock = require('./src/BemBlock').default;
const BemElem = require('./src/BemElem').default;
const BemMod = require('./src/BemMod').default;

export {

  config,
  utils,

  Events,

  BEMDOM,
  BEMHTML,

  BemEntity,
  BemBlock,
  BemElem,
  BemMod,

};
