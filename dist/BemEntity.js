"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/** @module BemEntity
 *  @since 2019.03.14, 09:26
 *  @changed 2019.06.11, 10:26
 */
var $ = window && window.$ || require('jquery'); // TODO: Use configuration or build options to select jquery: global or as module
// const $ = require('jquery');


var _require = require('./config'),
    config = _require.config;

var _require2 = require('./BEMDOM'),
    BEMDOM = _require2.BEMDOM;

var inherit = require('inherit');

var modDelim = config.modDelim,
    modValDelim = config.modValDelim;

var Events = require('./MicroEvents')["default"];
/** inherit BemEntity */


var BemEntity = inherit(
/** @lends BemEntity.prototype */
{
  __constructor: function __constructor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        params = _ref.params,
        props = _objectWithoutProperties(_ref, ["params"]);

    this._modsCache = {};
    this.params = Object.assign({}, params);
    Object.assign(this, props);
    var entityClass = props.entityClass;
    this._lastProto = entityClass;
    this.block = entityClass && entityClass.block; // TODO 2019.03.15, 08:32 -- Events factory?

    this._events = new Events();
  },
  // Events...

  /** Get events manager
   * @return {object}
   */
  events: function events() {
    return this._events;
  },

  /** Emit event from this instance
   * @param {string} eventType
   * @param {jQuery.Event} [event]
   * @param {*} ...args
   */
  emit: function emit(eventType, args) {
    args = Array.from(arguments).splice(1) || [];

    if (!eventType) {
      var error = new Error('emit: Unspecified eventType');
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    } // If no event passed in arguments then creating our own event...


    if (!(args[0] instanceof $.Event)) {
      // TODO: Make complete synthetic event realization?
      var syntheticEvent = {
        eventType: eventType,
        bemTarget: this
      };
      args.unshift(eventType, syntheticEvent);
    }

    var events = this.events();
    events && events.emit.apply(events, args);
  },
  // Entiry indetification...
  getBlockName: function getBlockName() {
    return this.entityClass.block;
  },
  getElemName: function getElemName() {
    return this.entityClass.elem;
  },

  /** Get block/elem name without mod specificators
   * @return {string}
   */
  getEntityName: function getEntityName() {
    return this.entityName;
  },

  /** Get block/elem name without mod specificators
   * @param {string} modName
   * @param {string} [modVal]
   * @return {string}
   */
  getModEntityClassName: function getModEntityClassName(modName, modVal) {
    var name = this.entityName;
    name += modDelim + modName;

    if (modVal && modVal !== true) {
      name += modValDelim + modVal;
    }

    return name;
  },

  /** Get block/elem name without mod specificators
   * @param {string} modName
   * @param {string} [modVal]
   * @return {string}
   */
  getModEntityName: function getModEntityName(modName, modVal) {
    return this.getModEntityClassName(modName, modVal);
  },

  /**
   * @param {object} [options]
   * @param {string} [options.prefix='uniq_']
   * @param {string} [options.postfix]
   * @return {string}
   */
  getUniqueId: function getUniqueId(options) {
    if (!this._uniqId) {
      this._uniqId = BEMDOM.getUniqueId(this, options);
    }

    return this._uniqId;
  },

  /** Get value from params or mods
   * @param {string} name
   * @return {*}
   */
  getFlag: function getFlag(name) {
    return this.params[name] || this.getMod(name);
  },

  /** Get entity id (from params or mods) or create unique id
   * @return {string}
   */
  getId: function getId() {
    if (!this._id) {
      this._id = this.getFlag('id') || this.getUniqueId();
    }

    return this._id;
  },
  // Traverse...

  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity[]}
   */
  findChildElems: function findChildElems(elem) {
    // Single elem name?
    var props = typeof elem === 'string' ? {
      elem: elem
    } : elem;
    var domElem = this.domElem,
        block = this.block;
    props = Object.assign({
      domElem: domElem,
      block: block
    }, props);
    var results = BEMDOM.findEntities(props);
    return results;
  },

  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity|undefined}
   */
  findChildElem: function findChildElem(elem) {
    var results = this.findChildElems(elem);
    return results && results[0];
  },

  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity[]}
   */
  findChildBlocks: function findChildBlocks(block) {
    // Single block name?
    var props = typeof block === 'string' ? {
      block: block
    } : block;
    var domElem = this.domElem;
    props = Object.assign({
      domElem: domElem
    }, props);
    var results = BEMDOM.findEntities(props);
    return results;
  },

  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity|undefined}
   */
  findChildBlock: function findChildBlock(block) {
    var results = this.findChildBlocks(block);
    return results && results[0];
  },

  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity[]}
   */
  findMixedBlocks: function findMixedBlocks(block) {
    // Single block name?
    var props = typeof block === 'string' ? {
      block: block
    } : block;
    var domElem = this.domElem;
    var select = 'filter';
    props = Object.assign({
      select: select,
      domElem: domElem
    }, props);
    var results = BEMDOM.findEntities(props);
    return results;
  },

  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity|undefined}
   */
  findMixedBlock: function findMixedBlock(block) {
    var results = this.findMixedBlocks(block);
    return results && results[0];
  },

  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity[]}
   */
  findParentBlocks: function findParentBlocks(block) {
    // Single block name?
    var props = typeof block === 'string' ? {
      block: block
    } : block;
    var domElem = this.domElem;
    var select = 'parents'; // 'closest';

    props = Object.assign({
      select: select,
      domElem: domElem
    }, props);
    var results = BEMDOM.findEntities(props);
    return results;
  },

  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity|undefined}
   */
  findParentBlock: function findParentBlock(block) {
    var results = this.findParentBlocks(block);
    return results && results[0];
  },

  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity[]}
   */
  findParentElems: function findParentElems(elem) {
    // Single elem name?
    var props = typeof elem === 'string' ? {
      elem: elem
    } : elem;
    var domElem = this.domElem,
        block = this.block;
    var select = 'closest';
    props = Object.assign({
      select: select,
      domElem: domElem,
      block: block
    }, props);
    var results = BEMDOM.findEntities(props);
    return results;
  },

  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity|undefined}
   */
  findParentElem: function findParentElem(elem) {
    var results = this.findParentElems(elem);
    return results && results[0];
  },
  // TODO: findBlockById?
  clearElemsCache: function clearElemsCache() {
    this._elemsCache = null;
  },

  /** Caching method for find single elem
   * @param {string} elemName - Elem name
   * @return {BemEntity|undefined}
   */
  _elem: function _elem(elemName) {
    if (typeof elemName !== 'string') {
      throw new Error('elem method expecting only element name');
    }

    var entity = this._elemsCache && this._elemsCache[elemName];

    if (!entity) {
      entity = this.findChildElem(elemName);

      if (entity) {
        (this._elemsCache || (this._elemsCache = {}))[elemName] = entity;
      }
    }

    return entity;
  },
  // Modifiers...

  /** Get all affected modifiers
   * @return {object}
   */
  getAllMods: function getAllMods() {
    return this._modsCache || {};
  },

  /**
   * @param {string} modName
   * @return {string} modVal
   */
  getMod: function getMod(modName) {
    var val = this._modsCache[modName];
    return val != null ? val : '';
  },

  /**
   * @param {string} modName
   * @param {*} modVal
   * @return {boolean}
   */
  hasMod: function hasMod(modName, modVal) {
    // const modVal = this.getMod(modName);
    // return !!modVal;
    var typeModVal = _typeof(modVal);

    if (typeModVal !== 'undefined' && typeModVal !== 'boolean') {
      modVal = modVal.toString();
    }

    var val = this.getMod(modName);
    var res = val === (modVal || '');
    return arguments.length === 1 ? !res : res;
  },

  /**
   * @param {string} modName
   * @param {string} [modVal]
   * @return {object} this
   */
  _delModClass: function _delModClass(modName) {
    var modVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var className = this.getModEntityClassName(modName, modVal);

    if (this.domElem.hasClass(className)) {
      this.domElem.removeClass(className);
    }

    return this;
  },

  /**
   * @param {string} modName
   * @param {string} [modVal]
   * @return {object} this
   */
  _setModClass: function _setModClass(modName) {
    var modVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var className = this.getModEntityClassName(modName, modVal);

    if (modVal) {
      if (!this.domElem.hasClass(className)) {
        this.domElem.addClass(className);
      }
    } else {
      if (this.domElem.hasClass(className)) {
        this.domElem.removeClass(className);
      }
    }

    return this;
  },

  /**
   * @param {string} modName
   * @param {string} [modVal='']
   * @return {object} this
   */
  setMod: function setMod(modName) {
    var modVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if ((this._processingMods || (this._processingMods = {}))[modName] == null) {
      if (modVal == null || modVal === false) {
        modVal = '';
      }

      var oldVal = this._modsCache[modName] || '';

      if (modVal !== oldVal) {
        if (typeof this.beforeSetMod === 'function') {
          // Check for mod changing availability (only boolean values)
          if (this.beforeSetMod(modName, modVal, oldVal) === false) {
            return this;
          }
        } // TODO: Set before call `beforeSetMod`?


        this._processingMods[modName] = oldVal;

        this._delModClass(modName, oldVal);

        this._setModClass(modName, modVal);

        this._modsCache[modName] = modVal;

        if (typeof this.onSetMod === 'function') {
          this.onSetMod(modName, modVal, oldVal);
        } // TODO: Emit events


        var modProps = {
          modName: modName,
          modVal: modVal,
          oldVal: oldVal
        };
        this.emit('setMod', modProps);
        this.emit('setMod_' + modName, modProps);
        this.emit('setMod_' + modName + '_' + String(modVal), modProps);
      }

      this._processingMods[modName] = null;
    }

    return this;
  },

  /**
   * @param {string} modName
   * @return {object} this
   */
  delMod: function delMod(modName) {
    return this.setMod(modName, '');
  },

  /**
   * @param {string} modName
   * @return {object} this
   */
  toggleMod: function toggleMod(modName) {
    var modVal = !this.hasMod(modName);
    return this.setMod(modName, modVal);
  },
  // Init/destroy...

  /**
   * @return {boolean}
   */
  wasInited: function wasInited() {
    return !!this.__inited;
  },
  // Events
  beforeSetMod: function beforeSetMod(modName, modVal
  /* , oldVal */
  ) {
    if (modName === 'js') {
      if (modVal === 'inited') {// if (typeof this.beforeInit === 'function') {
        //   this.beforeInit();
        // }
      } else if (!modVal) {// if (typeof this.beforeDestroy === 'function') {
        //   this.beforeDestroy();
        // }
        // if (typeof this.onDestroy === 'function') {
        //   this.onDestroy();
        // }
      }
    }
  },
  onSetMod: function onSetMod(modName, modVal
  /* , oldVal */
  ) {
    if (modName === 'js') {
      if (modVal === 'inited') {// if (typeof this.onInitMoment === 'function') {
        //   this.onInitMoment();
        // }
        // if (typeof this.onInit === 'function') {
        //   if (this.block === 'PageHeader' && this.elem === 'UserInfo') {
        //     console.log(this);
        //     debugger;
        //   }
        //   setTimeout(this.onInit.bind(this), 0);
        // }
        // if (typeof this.afterInit === 'function') {
        //   setTimeout(this.afterInit.bind(this), 0);
        // }
      } else if (!modVal) {// if (typeof this.onDestroyMoment === 'function') {
        //   this.onDestroyMoment();
        // }
        // if (typeof this.afterDestroy === 'function') {
        //   setTimeout(this.afterDestroy.bind(this), 0); // NOTE: WARNING: Use with care!!!
        // }
      }
    }
  }
});
var _default = BemEntity;
exports["default"] = _default;
//# sourceMappingURL=BemEntity.js.map