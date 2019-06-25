/** @module BemEntity
 *  @since 2019.03.14, 09:26
 *  @changed 2019.06.11, 10:26
 */

const $ = (window && window.$) || require('jquery'); // TODO: Use configuration or build options to select jquery: global or as module
// const $ = require('jquery');

const { config } = require('./config');

const { BEMDOM } = require('./BEMDOM');

const inherit = require('inherit');

const { /* elemDelim, */ modDelim, modValDelim } = config;

const Events = require('./Events').default;

/** inherit BemEntity */
const BemEntity = inherit(/** @lends BemEntity.prototype */ {

  __constructor: function({ params, ...props } = {}) {
    this._modsCache = {};
    this.params = Object.assign({}, params);
    Object.assign(this, props);
    const { entityClass } = props;
    this._lastProto = entityClass;
    this.block = entityClass && entityClass.block;
    // TODO 2019.03.15, 08:32 -- Events factory?
    this._events = new Events();
  },

  // Events...

  /** Get events manager
   * @return {object}
   */
  events: function() {
    return this._events;
  },
  /** Emit event from this instance
   * @param {string} eventType
   * @param {jQuery.Event} [event]
   * @param {*} ...args
   */
  emit: function(eventType, args) {

    args = Array.from(arguments).splice(1) || [];

    if (!eventType) {
      var error = new Error('emit: Unspecified eventType');
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }

    // If no event passed in arguments then creating our own event...
    if (!(args[0] instanceof $.Event)) {
      // TODO: Make complete synthetic event realization?
      var syntheticEvent = {
        eventType,
        bemTarget: this,
      };
      args.unshift(eventType, syntheticEvent);
    }

    var events = this.events();
    events && events.emit.apply(events, args);

  },

  // Entiry indetification...

  getBlockName: function() {
    return this.entityClass.block;
  },

  getElemName: function() {
    return this.entityClass.elem;
  },

  /** Get block/elem name without mod specificators
   * @return {string}
   */
  getEntityName: function() {
    return this.entityName;
  },
  /** Get block/elem name without mod specificators
   * @param {string} modName
   * @param {string} [modVal]
   * @return {string}
   */
  getModEntityClassName: function(modName, modVal) {
    let name = this.entityName;
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
  getModEntityName: function(modName, modVal) {
    return this.getModEntityClassName(modName, modVal);
  },

  /**
   * @param {object} [options]
   * @param {string} [options.prefix='uniq_']
   * @param {string} [options.postfix]
   * @return {string}
   */
  getUniqueId: function(options) {
    if (!this._uniqId) {
      this._uniqId = BEMDOM.getUniqueId(this, options);
    }
    return this._uniqId;
  },

  /** Get value from params or mods
   * @param {string} name
   * @return {*}
   */
  getFlag: function(name) {
    return this.params[name] || this.getMod(name);
  },

  /** Get entity id (from params or mods) or create unique id
   * @return {string}
   */
  getId: function() {
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
  findChildElems: function(elem) {
    // Single elem name?
    let props = (typeof elem === 'string') ? { elem } : elem;
    const { domElem, block } = this;
    props = Object.assign({ domElem, block }, props);
    const results = BEMDOM.findEntities(props);
    return results;
  },
  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity|undefined}
   */
  findChildElem: function(elem) {
    const results = this.findChildElems(elem);
    return results && results[0];
  },
  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity[]}
   */
  findChildBlocks: function(block) {
    // Single block name?
    let props = (typeof block === 'string') ? { block } : block;
    const { domElem } = this;
    props = Object.assign({ domElem }, props);
    const results = BEMDOM.findEntities(props);
    return results;
  },
  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity|undefined}
   */
  findChildBlock: function(block) {
    const results = this.findChildBlocks(block);
    return results && results[0];
  },
  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity[]}
   */
  findMixedBlocks: function(block) {
    // Single block name?
    let props = (typeof block === 'string') ? { block } : block;
    const { domElem } = this;
    const select = 'filter';
    props = Object.assign({ select, domElem }, props);
    const results = BEMDOM.findEntities(props);
    return results;
  },
  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity|undefined}
   */
  findMixedBlock: function(block) {
    const results = this.findMixedBlocks(block);
    return results && results[0];
  },
  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity[]}
   */
  findParentBlocks: function(block) {
    // Single block name?
    let props = (typeof block === 'string') ? { block } : block;
    const { domElem } = this;
    const select = 'parents'; // 'closest';
    props = Object.assign({ select, domElem }, props);
    const results = BEMDOM.findEntities(props);
    return results;
  },
  /**
   * @param {string|object} block - block name or block specs
   * @return {BemEntity|undefined}
   */
  findParentBlock: function(block) {
    const results = this.findParentBlocks(block);
    return results && results[0];
  },
  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity[]}
   */
  findParentElems: function(elem) {
    // Single elem name?
    let props = (typeof elem === 'string') ? { elem } : elem;
    const { domElem, block } = this;
    const select = 'closest';
    props = Object.assign({ select, domElem, block }, props);
    const results = BEMDOM.findEntities(props);
    return results;
  },
  /**
   * @param {string|object} elem - elem name or elem specs
   * @return {BemEntity|undefined}
   */
  findParentElem: function(elem) {
    const results = this.findParentElems(elem);
    return results && results[0];
  },

  // TODO: findBlockById?

  clearElemsCache: function() {
    this._elemsCache = null;
  },

  /** Caching method for find single elem
   * @param {string} elemName - Elem name
   * @return {BemEntity|undefined}
   */
  _elem: function(elemName) {
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
  getAllMods: function() {
    return this._modsCache || {};
  },

  /**
   * @param {string} modName
   * @return {string} modVal
   */
  getMod: function(modName) {
    var val = this._modsCache[modName];
    return (val != null) ? val : '';
  },
  /**
   * @param {string} modName
   * @param {*} modVal
   * @return {boolean}
   */
  hasMod: function(modName, modVal) {
    // const modVal = this.getMod(modName);
    // return !!modVal;
    var typeModVal = typeof modVal;
    if (typeModVal !== 'undefined' && typeModVal !== 'boolean') {
      modVal = modVal.toString();
    }
    var val = this.getMod(modName);
    var res = val === (modVal || '');
    return arguments.length === 1? !res : res;
  },
  /**
   * @param {string} modName
   * @param {string} [modVal]
   * @return {object} this
   */
  _delModClass: function(modName, modVal = true) {
    const className = this.getModEntityClassName(modName, modVal);
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
  _setModClass: function(modName, modVal = true) {
    const className = this.getModEntityClassName(modName, modVal);
    if (modVal) {
      if (!this.domElem.hasClass(className)) {
        this.domElem.addClass(className);
      }
    }
    else {
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
  setMod: function(modName, modVal = true) {

    if ((this._processingMods || (this._processingMods = {}))[modName] == null) {

      if (modVal == null || modVal === false) {
        modVal = '';
      }

      const oldVal = this._modsCache[modName] || '';

      if (modVal !== oldVal) {

        if (typeof this.beforeSetMod === 'function') {
          // Check for mod changing availability (only boolean values)
          if (this.beforeSetMod(modName, modVal, oldVal) === false) {
            return this;
          }
        }

        // TODO: Set before call `beforeSetMod`?
        this._processingMods[modName] = oldVal;

        this._delModClass(modName, oldVal);
        this._setModClass(modName, modVal);
        this._modsCache[modName] = modVal;

        if (typeof this.onSetMod === 'function') {
          this.onSetMod(modName, modVal, oldVal);
        }

        // TODO: Emit events
        var modProps = { modName, modVal, oldVal };
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
  delMod: function(modName) {
    return this.setMod(modName, '');
  },
  /**
   * @param {string} modName
   * @return {object} this
   */
  toggleMod: function(modName) {
    var modVal = !this.hasMod(modName);
    return this.setMod(modName, modVal);
  },

  // Init/destroy...

  /**
   * @return {boolean}
   */
  wasInited: function() {
    return !!this.__inited;
  },

  // Events

  beforeSetMod: function(modName, modVal/* , oldVal */) {
    if (modName === 'js') {
      if (modVal === 'inited') {
        // if (typeof this.beforeInit === 'function') {
        //   this.beforeInit();
        // }
      }
      else if (!modVal) {
        // if (typeof this.beforeDestroy === 'function') {
        //   this.beforeDestroy();
        // }
        // if (typeof this.onDestroy === 'function') {
        //   this.onDestroy();
        // }
      }
    }
  },
  onSetMod: function(modName, modVal/* , oldVal */) {
    if (modName === 'js') {
      if (modVal === 'inited') {
        // if (typeof this.onInitMoment === 'function') {
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
      }
      else if (!modVal) {
        // if (typeof this.onDestroyMoment === 'function') {
        //   this.onDestroyMoment();
        // }
        // if (typeof this.afterDestroy === 'function') {
        //   setTimeout(this.afterDestroy.bind(this), 0); // NOTE: WARNING: Use with care!!!
        // }
      }
    }
  },

});

export default BemEntity;
