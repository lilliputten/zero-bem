"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** @module utils
 *  @since 2019.03.09, 22:54
 *  @changed 2019.06.25, 10:27
 */
var _require = require('./config'),
    config = _require.config;

var elemDelim = config.elemDelim,
    modDelim = config.modDelim,
    modValDelim = config.modValDelim;
var utils =
/** @lends utils */
{
  // Misc utils (from i-bem)

  /**
   */
  specialModConditions: {
    '!': function _(modVal, _modVal
    /* , _prevModVal */
    ) {
      return _modVal !== modVal;
    },
    '~': function _(modVal, _modVal, _prevModVal) {
      return _prevModVal === modVal;
    }
  },

  /**
   * Builds the function for the handler method for setting a modifier
   * for special syntax
   * @param {String} modVal Declared modifier value
   * @param {Function} curModFn Declared modifier handler
   * @param {Function} [prevModFn] Previous handler
   * @param {Function} [condition] Condition function
   * (called with declared, set and previous modifier values)
   * @returns {Function}
   */
  buildSpecialModFn: function buildSpecialModFn(modVal, _curModFn, prevModFn, condition) {
    if (prevModFn || condition) {
      _curModFn = function curModFn(_modName, _modVal, _prevModVal) {
        var res1, res2;

        if (prevModFn) {
          res1 = prevModFn.apply(this, arguments) === false;
        }

        condition = condition ? condition(modVal, _modVal, _prevModVal) : true;

        if (condition) {
          res2 = _curModFn.apply(this, arguments) === false;
        }

        if (res1 || res2) {
          return false;
        }
      };
    }

    return _curModFn;
  },

  /**
   * Builds the name of the handler method for setting a modifier
   * @param {String} prefix
   * @param {String} modName Modifier name
   * @param {String} modVal Modifier value
   * @returns {String}
   */
  buildModFnName: function buildModFnName(prefix, modName, modVal) {
    return '__' + prefix + '__mod' + (modName ? '_' + modName : '') + (modVal ? '_' + modVal : '');
  },

  /**
   * Transforms a hash of modifier handlers to methods
   * @param {String} prefix
   * @param {Object} modFns
   * @param {Object} props
   */
  modFnsToProps: function modFnsToProps(prefix, modFns, props) {
    if (typeof modFns === 'function') {
      props[this.buildModFnName(prefix, '*', '*')] = modFns;
    } else {
      var modName, modVal, modFn;

      for (modName in modFns) {
        modFn = modFns[modName];

        if (typeof modFn === 'function') {
          props[this.buildModFnName(prefix, modName, '*')] = modFn;
        } else {
          var starModFnName = this.buildModFnName(prefix, modName, '*');

          for (modVal in modFn) {
            var curModFn = modFn[modVal];
            var modValPrefix = modVal[0];

            if (modValPrefix === '!' || modValPrefix === '~' || modVal === '*') {
              modVal === '*' || (modVal = modVal.substr(1));
              props[starModFnName] = this.buildSpecialModFn(modVal, curModFn, props[starModFnName], this.specialModConditions[modValPrefix]);
            } else {
              props[this.buildModFnName(prefix, modName, modVal)] = curModFn;
            }
          }
        }
      }
    }
  },

  /**
   */
  convertModHandlersToMethods: function convertModHandlersToMethods(props) {
    if (props.beforeSetMod) {
      this.modFnsToProps('before', props.beforeSetMod, props);
      delete props.beforeSetMod;
    }

    if (props.onSetMod) {
      this.modFnsToProps('after', props.onSetMod, props);
      delete props.onSetMod;
    }
  },

  /**
   */
  checkMod: function checkMod(block, modName, modVal) {
    var prevModVal = block._processingMods && block._processingMods[modName]; // check if a block has either current or previous modifier value equal to passed modVal

    return modVal === '*' ?
    /* jshint eqnull: true */
    block.hasMod(modName) || prevModVal != null : block.hasMod(modName, modVal) || prevModVal === modVal;
  },

  /**
   */
  buildCheckMod: function buildCheckMod(modName, modVal) {
    var _this = this;

    modVal = modVal || true; // TODO: To check for special mod values ('', '*', false, etc)???

    if (Array.isArray(modVal)) {
      return function (block) {
        for (var i = 0; i < modVal.length; i++) {
          if (_this.checkMod(block, modName, modVal[i])) {
            return true;
          }
        }
      };
    } else {
      return function (block) {
        return _this.checkMod(block, modName, modVal);
      };
    }
  },
  // Entities methods...

  /**
   * @param {object} srcObject
   * @param {object} tgtProto
   * @return {object} srcObject
   */
  changeObjectPrototype: function changeObjectPrototype(srcObject, tgtProto) {
    if (srcObject) {
      var setProto = tgtProto.prototype || tgtProto;
      Object.setPrototypeOf(srcObject, setProto);
    }

    return srcObject;
  },
  // Identification...

  /** TODO: Quote string for use as part of regexp (quote special symbols: '.*+'
   */
  _quoteReg: function _quoteReg(s) {
    s = s.replace(/[.*+]/g, '\\$1');
    return s;
  },

  /** Get or compile regexps for search/parse methods
   * @return {object}
   */
  getRegexps: function getRegexps() {
    if (!this._regexps) {
      // Parse entities names regexps...
      // TODO 2019.03.14, 20:02 -- Construct on demand into object property?
      // const matchBoundary = '\\b';
      var matchBegin = '^';
      var matchId = '[A-Za-z][A-Za-z0-9]*';
      var matchIdGroup = '(' + matchId + ')';
      var matchRestGroup = '(.*)$';
      var blockMatch = new RegExp(matchBegin + matchIdGroup + matchRestGroup);
      var elemMatch = new RegExp(matchBegin + this._quoteReg(elemDelim) + matchIdGroup + matchRestGroup);
      var modNameMatch = new RegExp(matchBegin + this._quoteReg(modDelim) + matchIdGroup + matchRestGroup);
      var modValMatch = new RegExp(matchBegin + this._quoteReg(modValDelim) + matchRestGroup);
      this._regexps = {
        blockMatch: blockMatch,
        elemMatch: elemMatch,
        modNameMatch: modNameMatch,
        modValMatch: modValMatch
      };
    }

    return this._regexps;
  },

  /**
   * @param {string} entityName
   * @return {object}
   */
  parseDomEntityName: function parseDomEntityName(entityName) {
    var regexps = this.getRegexps();
    var props = {};
    var rest;
    var foundBlock = entityName.match(regexps.blockMatch); // block?

    if (foundBlock) {
      props.block = foundBlock[1];
      rest = foundBlock[2];

      if (rest) {
        var foundElem = rest.match(regexps.elemMatch); // elem?

        if (foundElem) {
          props.elem = foundElem[1];
          rest = foundElem[2];
        }
      } // mod?


      if (rest) {
        var foundModName = rest.match(regexps.modNameMatch);
        props.modName = foundModName[1];
        rest = foundModName[2]; // modVal?

        if (rest) {
          var foundModVal = rest.match(regexps.modValMatch);
          props.modVal = foundModVal[1];
        }

        if (!props.modVal || props.modVal === 'true') {
          props.modVal = true;
        }
      }
    }

    return props;
  },

  /** Get block/elem name without mod specificators
   * @param {bemProto} entityClass
   * @return {string}
   */
  getEntityName: function getEntityName(entityClass) {
    var name = entityClass.block;

    if (entityClass.elem) {
      name += elemDelim + entityClass.elem;
    }

    return name;
  },

  /**
   * @param {object|string} props
   * @param {string} props.block
   * @param {string} [props.elem]
   * @param {string} [props.modName]
   * @param {string|boolean} [props.modVal=true]
   * @return {string}
   */
  getEntityClassName: function getEntityClassName(props) {
    var propsType = _typeof(props); // If already class name (string)


    if (props && propsType === 'string') {
      return props;
    } // If complex object...
    else if (props && propsType === 'object') {
        var block = props.block,
            elem = props.elem,
            modName = props.modName,
            modVal = props.modVal;
        var name = block;

        if (elem) {
          name += elemDelim + elem;
        }

        if (modName && modVal !== false) {
          name += modDelim + modName; // const modValStr = (modVal === true || modVal == null) ? 'true' : String(modVal);

          if (modVal !== true && modVal != null) {
            name += modDelim + modVal;
          }
        }

        return name;
      } else {
        throw new Error('getEntityClassName: Undefined props type: ' + propsType);
      }
  },
  // Traversing...

  /**
   * TODO Cache results? + cache reset?
   * @param {string} [select='find']
   * @param {jQuery} domElem
   * @param {string} entityName
   * @param {boolean} [onlyFirst]
   * @return {jQuery}
   */
  findDomEntities: function findDomEntities() {
    var select = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'find';
    var domElem = arguments.length > 1 ? arguments[1] : undefined;
    var entityName = arguments.length > 2 ? arguments[2] : undefined;
    var onlyFirst = arguments.length > 3 ? arguments[3] : undefined;

    if (_typeof(entityName) === 'object') {
      entityName = this.getEntityClassName(entityName);
    }

    if (!domElem) {
      var error = new Error('domElem not specified');
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    }

    if (typeof domElem[select] !== 'function') {
      var _error = new Error('Unknown jQuery traverse method: ' + select);

      console.error(_error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw _error;
    }

    var selector = '.' + entityName;

    if (onlyFirst) {
      selector += ':first';
    }

    var results = domElem[select](selector);
    return results;
  }
};
exports.utils = utils;
//# sourceMappingURL=utils.js.map