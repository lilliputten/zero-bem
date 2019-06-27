"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BemMod = exports.BemElem = exports.BemBlock = exports.BemEntity = exports.BEMHTML = exports.BEMDOM = exports.utils = exports.config = void 0;

/** @module zero-bem
 *  @description zero-bem library index
 *  @since 2019.03.16, 00:05
 *  @changed 2019.06.26, 15:31
 */
var _require = require('../BEMHTML/BEMHTML'),
    BEMHTML = _require.BEMHTML;

exports.BEMHTML = BEMHTML;

var _require2 = require('./BEMDOM'),
    BEMDOM = _require2.BEMDOM;

exports.BEMDOM = BEMDOM;

var _require3 = require('./config'),
    config = _require3.config;

exports.config = config;

var _require4 = require('./utils'),
    utils = _require4.utils; // const Events = require('./MicroEvents').default;


exports.utils = utils;

var BemEntity = require('./BemEntity')["default"];

exports.BemEntity = BemEntity;

var BemBlock = require('./BemBlock')["default"];

exports.BemBlock = BemBlock;

var BemElem = require('./BemElem')["default"];

exports.BemElem = BemElem;

var BemMod = require('./BemMod')["default"];

exports.BemMod = BemMod;
//# sourceMappingURL=index.js.map