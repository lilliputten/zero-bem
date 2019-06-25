/** @module utils
 *  @since 2019.03.09, 22:54
 *  @changed 2019.06.25, 10:27
 */

const { config } = require('./config');
const { elemDelim, modDelim, modValDelim } = config;

export const utils = /** @lends utils */ {

  // Misc utils (from i-bem)

  /**
   */
  specialModConditions: {
    '!' : function(modVal, _modVal/* , _prevModVal */) {
      return _modVal !== modVal;
    },
    '~' : function(modVal, _modVal, _prevModVal) {
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
  buildSpecialModFn: function(modVal, curModFn, prevModFn, condition) {
    if (prevModFn || condition) {
      curModFn = function(_modName, _modVal, _prevModVal) {
        var res1, res2;
        if (prevModFn) {
          (res1 = prevModFn.apply(this, arguments) === false);
        }
        condition = condition ? condition(modVal, _modVal, _prevModVal) : true;
        if (condition) {
          res2 = (curModFn.apply(this, arguments) === false);
        }
        if (res1 || res2) {
          return false;
        }
      };
    }
    return curModFn;
  },
  /**
   * Builds the name of the handler method for setting a modifier
   * @param {String} prefix
   * @param {String} modName Modifier name
   * @param {String} modVal Modifier value
   * @returns {String}
   */
  buildModFnName: function(prefix, modName, modVal) {
    return '__' + prefix +
       '__mod' +
       (modName? '_' + modName : '') +
       (modVal? '_' + modVal : '');
  },
  /**
   * Transforms a hash of modifier handlers to methods
   * @param {String} prefix
   * @param {Object} modFns
   * @param {Object} props
   */
  modFnsToProps: function(prefix, modFns, props) {
    if (typeof modFns === 'function') {
      props[this.buildModFnName(prefix, '*', '*')] = modFns;
    }
    else {
      var modName, modVal, modFn;
      for (modName in modFns) {
        modFn = modFns[modName];
        if (typeof modFn === 'function') {
          props[this.buildModFnName(prefix, modName, '*')] = modFn;
        }
        else {
          var starModFnName = this.buildModFnName(prefix, modName, '*');
          for (modVal in modFn) {
            var curModFn = modFn[modVal];
            var modValPrefix = modVal[0];
            if(modValPrefix === '!' || modValPrefix === '~' || modVal === '*') {
              modVal === '*' || (modVal = modVal.substr(1));
              props[starModFnName] = this.buildSpecialModFn(
                modVal,
                curModFn,
                props[starModFnName],
                this.specialModConditions[modValPrefix]
              );
            }
            else {
              props[this.buildModFnName(prefix, modName, modVal)] = curModFn;
            }
          }
        }
      }
    }
  },
  /**
   */
  convertModHandlersToMethods: function(props) {
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
  checkMod: function(block, modName, modVal) {
    var prevModVal = block._processingMods && block._processingMods[modName];

    // check if a block has either current or previous modifier value equal to passed modVal
    return modVal === '*'?
      /* jshint eqnull: true */
      block.hasMod(modName) || prevModVal != null :
      block.hasMod(modName, modVal) || prevModVal === modVal;
  },
  /**
   */
  buildCheckMod: function(modName, modVal) {
    modVal = modVal || true; // TODO: To check for special mod values ('', '*', false, etc)???
    if (Array.isArray(modVal) ) {
      return (block) => {
        for (var i = 0; i < modVal.length; i++) {
          if (this.checkMod(block, modName, modVal[i])) {
            return true;
          }
        }
      };
    }
    else {
      return (block) => {
        return this.checkMod(block, modName, modVal);
      };
    }
  },

  // Entities methods...

  /**
   * @param {object} srcObject
   * @param {object} tgtProto
   * @return {object} srcObject
   */
  changeObjectPrototype: function(srcObject, tgtProto) {
    if (srcObject) {
      const setProto = tgtProto.prototype || tgtProto;
      Object.setPrototypeOf(srcObject, setProto);
    }
    return srcObject;
  },

  // Identification...

  /** TODO: Quote string for use as part of regexp (quote special symbols: '.*+'
   */
  _quoteReg: function(s) {
    s = s
      .replace(/[.*+]/g, '\\$1')
    ;
    return s;
  },

  /** Get or compile regexps for search/parse methods
   * @return {object}
   */
  getRegexps: function() {
    if ( !this._regexps) {
      // Parse entities names regexps...
      // TODO 2019.03.14, 20:02 -- Construct on demand into object property?
      // const matchBoundary = '\\b';
      const matchBegin = '^';
      const matchId = '[A-Za-z][A-Za-z0-9]*';
      const matchIdGroup = '(' + matchId + ')';
      const matchRestGroup = '(.*)$';
      const blockMatch = new RegExp(matchBegin + matchIdGroup + matchRestGroup);
      const elemMatch = new RegExp(matchBegin + this._quoteReg(elemDelim) + matchIdGroup + matchRestGroup);
      const modNameMatch = new RegExp(matchBegin + this._quoteReg(modDelim) + matchIdGroup + matchRestGroup);
      const modValMatch = new RegExp(matchBegin + this._quoteReg(modValDelim) + matchRestGroup);
      this._regexps = {
        blockMatch,
        elemMatch,
        modNameMatch,
        modValMatch,
      };
    }
    return this._regexps;
  },

  /**
   * @param {string} entityName
   * @return {object}
   */
  parseDomEntityName: function(entityName) {
    const regexps = this.getRegexps();
    const props = {};
    let rest;
    const foundBlock = entityName.match(regexps.blockMatch);
    // block?
    if (foundBlock) {
      props.block = foundBlock[1];
      rest =  foundBlock[2];
      if (rest) {
        const foundElem = rest.match(regexps.elemMatch);
        // elem?
        if (foundElem) {
          props.elem = foundElem[1];
          rest = foundElem[2];
        }
      }
      // mod?
      if (rest) {
        const foundModName = rest.match(regexps.modNameMatch);
        props.modName = foundModName[1];
        rest = foundModName[2];
        // modVal?
        if (rest) {
          const foundModVal = rest.match(regexps.modValMatch);
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
  getEntityName: function(entityClass) {
    let name = entityClass.block;
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
  getEntityClassName: function(props) {
    var propsType = typeof props;
    // If already class name (string)
    if (props && propsType === 'string') {
      return props;
    }
    // If complex object...
    else if (props && propsType === 'object') {
      const { block, elem, modName, modVal } = props;
      var name = block;
      if (elem) {
        name += elemDelim + elem;
      }
      if (modName && modVal !== false) {
        name += modDelim + modName;
        // const modValStr = (modVal === true || modVal == null) ? 'true' : String(modVal);
        if (modVal !== true && modVal != null) {
          name += modDelim + modVal;
        }
      }
      return name;
    }
    else {
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
  findDomEntities: function(select='find', domElem, entityName, onlyFirst) {
    if (typeof entityName === 'object') {
      entityName = this.getEntityClassName(entityName);
    }
    if (!domElem) {
      const error = new Error('domElem not specified');
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    if (typeof domElem[select] !== 'function') {
      const error = new Error('Unknown jQuery traverse method: ' + select);
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    let selector = '.' + entityName;
    if (onlyFirst) {
      selector += ':first';
    }
    const results = domElem[select](selector);
    return results;
  },

};
