/** @module BEMDOM
 *  @description BEMDOM
 *  @since 2019.03.09, 22:54
 *  @changed 2019.04.03, 22:16
 *
 *  TODO:
 *    - 2019.03.14, 22:41 -- To ensure not to twice hydrating/initialing dom/entity?
 */

const inherit = require('inherit');

// const objects = require('lib/objects').default;

const $ = (window && window.$) || require('jquery');

const { config } = require('./config');
const { utils } = require('./utils');

const { modDelim, jsClass } = config;

export const BEMDOM = /** @lends BEMDOM */ {

  // Entities registry (all entity classes)
  entitiesRegistry: {},

  // List of all instances in use
  instances: [],

  // modsRegistry: {},

  // Hash for count unique ids...
  _uniqueIds: {},

  // DOM methods...

  /**
   * @param {string} method - jQuery method (append, prepend)
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   * @return {jQueryCollection|undefined}
   */
  injectContent: function(method, parent, html) {
    // If BemEntity, get jQueryCollection...
    if (parent.domElem) {
      parent = parent.domElem;
    }
    // Check error
    if (typeof parent[method] !== 'function') {
      const error = new Error('BEMDOM: injectContent: jQuery method is absent: ' + method);
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    var domObj;
    if (typeof html === 'string') {
      // Catching jquery exception on trying to create dom entity for plain string
      try {
        domObj = $(html);
      }
      catch(e) {
        // Pass thru
      }
    }
    else {
      domObj = html;
    }
    // Create dom objects...
    if (domObj && domObj.length) {
      parent[method](domObj);
      this.hydrate(domObj);
    }
    // Create raw content
    else {
      parent[method](html);
    }
    return domObj;
  },

  /** Append content to dom
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   */
  append: function(parent, html) {
    return this.injectContent('append', parent, html);
  },
  /** Append content to dom
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   */
  prepend: function(parent, html) {
    return this.injectContent('prepend', parent, html);
  },

  // TODO: replace
  /** Replace dom element content
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   */
  replace: function(parent, html) {
    // Cleanup current dom entities
    this.remove(parent, { remainSelf: true });
    // ...and replace it...
    return this.injectContent('replaceWith', parent, html);
  },

  /** Replace all previous content with new specified
   * @param {jQuery|BemEntity} domElem
   * @param {string|jQuery} html
   */
  update: function(domElem, html) {
    if (domElem) {
      domElem = domElem.domElem || domElem;
      const children = domElem.children();
      children.map((_n, childElem) => {
        this.remove($(childElem));
      });
      // Remove plain html
      domElem.html('');
    }
    this.append(domElem, html);
    return domElem;
  },

  /** Remove DOM Node & destroy all bem instances on it
   * @param {jQuery|BemEntity} domElem
   * @param {object} [opt]
   * @param {boolean} [opt.remainSelf]
   * @return {BEMDOM}
   */
  remove: function(domElem, opt) {
    opt = opt || {};
    if (domElem) {
      // BemEntity?
      domElem = domElem.domElem || domElem;
      // Raw DOM object? -> jQuery object
      if (domElem.tagName) {
        domElem = $(domElem);
      }
      const bemInstances = domElem.data('bemInstances') || {};
      const domEntities = bemInstances && Object.keys(bemInstances) || [];
      // Destroy all DOM entities...
      if (domEntities && domEntities.length) {
        domEntities.map((entityName) => {
          return this.destroyDomElemEntity(domElem, entityName);
        });
      }
      // Find DOM childs...
      var children = Array.from(domElem.children());
      if (children && children.length) {
        // And remove all of them...
        children.map(this.remove, this);
      }
      if (!opt.remainSelf) {
        domElem.remove();
      }
    }
    return this;
  },

  // Decl methods..

  /**
   * @param {object|string} block - Block name or inherited class
   * @param {function|Array[function]} [base] - base block + mixes
   * @param {object} [props]
   * @param {object} [staticProps]
   * @return {object} block
   * Inhertited class form: declBlock(BlockClass)
   * Props form: declBlock(blockName, base, blockProps, blockStaticProps)
   */
  declBlock: function(block, base, props, staticProps) {
    var blockClass = block;
    var entityName = block;
    // Inheriting from props/staticProps
    if (typeof block === 'string') {
      // No base? -- Use BemBlock as proto, shift all other args
      if (typeof base === 'object' && !Array.isArray(base)) {
        staticProps = props;
        props = base;
        base = this.BemBlockProto;
      }
      // Base: add BemBlock as first inheritance element
      else {
        if (!Array.isArray(base)) {
          base = [base];
        }
        base.unshift(this.BemBlockProto);
      }
      // Creating inherited class
      blockClass = inherit(base, props, staticProps || { block: entityName });
      /*DEBUG*/ blockClass.__name = entityName;
    }
    // Esle -- already inherited class -- fetch name
    else if (typeof block === 'function') {
      entityName = blockClass.block;
    }
    // Throw error for invalid block parameter?
    // TODO: To redefine class???
    if (this.entitiesRegistry[entityName]) {
      var error = new Error('BEMDOM: Block already defined: ' + entityName);
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    this.entitiesRegistry[entityName] = { entityClass: blockClass };
    return blockClass;
  },
  /**
   * @param {object} elemClass
   * @return {object} elemClass
   */
  declElem: function(elemClass) {
    const { block, elem } = elemClass;
    const entityName = utils.getEntityClassName({ block, elem });
    if (this.entitiesRegistry[entityName]) {
      const error = new Error('BEMDOM: Block elem already defined: ' + entityName);
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    this.entitiesRegistry[entityName] = { entityClass: elemClass };
    return elemClass;
  },

  /** Declares modifier
   * @param {Object} base
   * @param {Object} mod
   * @param {String} mod.modName
   * @param {String|Boolean|Array} [mod.modVal]
   * @param {Object} props
   * @param {Object} [staticProps]
   * @returns {Function}
   */
  declMod: function(base, mod, props, staticProps) {

    props && utils.convertModHandlersToMethods(props);

    var checkMod = utils.buildCheckMod(mod.modName, mod.modVal);
    var basePtp = base.prototype;

    // objects.each(props, function(prop, name) {
    // Object.entries(props).forEach(function([name, prop]) {
    Object.keys(props).forEach(function(name) {
      var prop = props[name];
      if (typeof prop === 'function') {
        props[name] = function() {
          var method;
          if(checkMod(this)) {
            method = prop;
          }
          else {
            var baseMethod = basePtp[name];
            if (baseMethod && baseMethod !== prop) {
              method = this.__base;
            }
          }
          if (method) {
            return method.apply(this, arguments);
          }
        };
      }
    });

    return inherit.self(base, props, staticProps);

  },

  /* // Old methods -- trying to override ES6 classes hierarchy (To remove?)
   *
   * [>* Old declMod method
   *  * @param {object|function} testMod
   *  * @param {object} modClass
   *  * @return {object} modClass
   *  <]
   * declMod: function(base, mod, props, staticProps) {
   *   const modClass = this._declMod(base, mod, props, staticProps);
   *   const { block, elem } = modClass;
   *   let { modName, modVal, testMod } = modClass;
   *   if (!testMod) {
   *     testMod = modClass.testMod = { modName };
   *     if (modVal) {
   *       testMod.modVal = modVal;
   *     }
   *   }
   *   const entityName = utils.getEntityName({ block, elem });
   *   // const entityClass = this.getOrCreateEntityClass(entityName);
   *   const modEntityName = utils.getEntityClassName({ block, elem, modName, modVal });
   *   if (this.entitiesRegistry[modEntityName]) {
   *     const error = new Error('Mod already defined: ' + modEntityName);
   *     console.error(error); // eslint-disable-line no-console
   *     [>DEBUG<] debugger; // eslint-disable-line no-debugger
   *     throw error;
   *   }
   *   this.entitiesRegistry[modEntityName] = { entityClass: modClass };
   *   if (!this.modsRegistry[entityName]) {
   *     this.modsRegistry[entityName] = {};
   *   }
   *   // const proto = Object.create(modClass);
   *   this.modsRegistry[entityName][modEntityName] = { modClass };
   *   return modClass;
   * },
   * [>*
   *  * @param {Object} modClass
   *  * @param {string} modName
   *  * @param {*} [modVal='']
   *  * @return {boolean}
   *  <]
   * _testModClass: function(modClass, modName, modVal='') {
   *   const { testMod } = modClass;
   *   if (typeof testMod === 'function') {
   *     return testMod.call(modClass, modName, modVal);
   *   }
   *   else if (typeof testMod === 'object') {
   *     const testModName = testMod.modName;
   *     const testModVal = testMod.modVal || true;
   *     const matched = (testModName === modName && (testModVal === '*' || testModVal === modVal));
   *     return matched;
   *   }
   *   else {
   *     const error = new Error('Unexpected testMod type: ' + typeof testMod);
   *     console.error(error); // eslint-disable-line no-console
   *     [>DEBUG<] debugger; // eslint-disable-line no-debugger
   *     throw error;
   *   }
   * },
   * [>* Get appropriate mod prototypes
   *  * @param {BemEntity} instance
   *  * @param {string} modName
   *  * @param {*} [modVal='']
   *  * @return {Object} modClass
   *  <]
   * _getAppropriateModProto: function(instance, modName, modVal='') {
   *   // const { block, elem } = instance;
   *   const entityName = instance.getEntityName();
   *   // const modEntityName = instance.getModEntityName(modName, modVal);
   *   const entityModsRegistry = this.modsRegistry[entityName];
   *   const entityMods = entityModsRegistry && Object.values(entityModsRegistry);
   *   const foundModClasses = [];
   *   // If has declared mods...
   *   if (entityMods && Array.isArray(entityMods) && entityMods.length) {
   *     // Test all mods with `modClass.testMod`...
   *     entityMods.filter((modEntry) => {
   *       const { modClass } = modEntry;
   *       if (this._testModClass(modClass, modName, modVal)) {
   *         // OBSOLETE???
   *         // if (!modEntry._protoFixed) {
   *         //   // Set proto to entityClass
   *         //   const entityClass = this.getOrCreateEntityClass(entityName);
   *         //   console.log(instance.checkMod);
   *         //   // Object.setPrototypeOf(modClass.prototype, entityClass.prototype);
   *         //   Object.setPrototypeOf(instance, modClass.prototype);
   *         //   modEntry._protoFixed = true;
   *         // }
   *         foundModClasses.push(modClass);
   *       }
   *     });
   *   }
   *   return foundModClasses.length ? foundModClasses[0] : instance.entityClass;
   * },
   * [>* Apply mod classes
   *  * @param {BemEntity} instance
   *  * @param {string} modName
   *  * @param {*} [modVal='']
   *  * @return {BemEntity} instance
   *  <]
   * applyModBehavior: function(instance, modName, modVal='') {
   *   const modClass = this._getAppropriateModProto(instance, modName, modVal);
   *   if (modClass) {
   *     // Change proto class
   *     if (modClass && modClass !== instance._lastProto) {
   *       Object.setPrototypeOf(instance, modClass.prototype);
   *       // Object.setPrototypeOf(instance, modClass);
   *       instance._lastProto = modClass;
   *     }
   *   }
   *   return instance;
   * },
   */

  // Traversing...

  /** Find entries in any relation state (parents, childs, siblings)
   * @param {object} props
   * @param {string} [props.select=find] - jQuery traverse method name (find, parent, filter etc)
   * @param {jQuery} props.domElem
   * @param {string} props.block
   * @param {string} [props.elem]
   * @param {string} [props.modName]
   * @param {*} [props.modVal=true]
   * @return {jQuery}
   * TODO Cache results? + cache reset?
   */
  findEntities: function({ select, domElem, block, elem, modName, modVal }) {
    if (!domElem) {
      const error = new Error('BEMDOM: domElem not specified');
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    if (!block) {
      const error = new Error('BEMDOM: Property `block` not specified');
      console.error(error); // eslint-disable-line no-console
      /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      throw error;
    }
    // select = select || 'find';
    const results = [];
    const entityName = utils.getEntityName({ block, elem });
    const className = utils.getEntityClassName({ block, elem, modName, modVal });
    const jqResults = utils.findDomEntities(select || 'find', domElem, className);
    jqResults.map((_n, dom) => {
      const entityDomElem = $(dom);
      const bemInstances = entityDomElem.data('bemInstances') || [];
      let instance = bemInstances[entityName];
      if (!instance) {
        instance = this.hydrateDomElemEntity(entityDomElem, entityName);
      }
      if (instance && !instance.wasInited()) {
        this.initDomElem(entityDomElem);
      }
      if (instance) {
        results.push(instance);
      }
    });
    return results;
  },

  // Entities...

  /**
   * @param {object|string} props
   * @param {string} props.block
   * @param {string} [props.elem]
   * @param {string} [props.modName]
   * @param {string|boolean} [props.modVal=true]
   * @return {string}
   */
  getEntityClassName: function(props) {
    return utils.getEntityClassName(props);
  },

  /**
   * @param {string|BemEntity} entity
   * @param {object} [options]
   * @param {string} [options.prefix='uniq_']
   * @param {string} [options.postfix='']
   * @return {string}
   */
  getUniqueId: function(entity, options) {
    // Default options...
    options = Object.assign({ prefix: 'uniq_', postfix: '' }, options);
    // Create id
    var id = options.prefix + this.getEntityClassName(entity) + options.postfix;
    // Get current count
    var uniqueIdCount = this._uniqueIds[id] || 0;
    // Update next value (and current id number)
    var nextUniqueIdCount = this._uniqueIds[id] = uniqueIdCount + 1;
    // Create unique id
    if (uniqueIdCount) {
      id += '_' + nextUniqueIdCount;
    }
    return id;
  },

  // Instances...

  /**
   * @return {number}
   */
  getInstancesCount: function() {
    return this.instances.length;
  },

  /**
   * @return {number}
   */
  getInstancesInfo: function() {
    return this.instances.map((item/* , n */) => {
      return item.getEntityName() + ': ' + item.getId();
      // return {
      //   name: item.getEntityName(),
      //   id: item.getId(),
      // };
    });
  },

  // Hydrate methods...

  /**
   */
  getOrCreateEntityClass: function(entityName) {

    // Try to get existing prototype
    let entityClass = this.entitiesRegistry[entityName] && this.entitiesRegistry[entityName].entityClass;

    // Found?
    if (entityClass) {
      return entityClass;
    }

    // If not found, then crate new one...

    // Get bem props (block, elem, mod...)
    const bemProps = utils.parseDomEntityName(entityName);

    // Block or elem?
    const isElem = !!bemProps.elem;
    const proto = isElem ? this.BemElemProto : this.BemBlockProto;

    // Create and store entity proto dynamically
    entityClass = inherit(proto, {});
    Object.assign(entityClass, bemProps);
    // entityClass = _cls_ dummyProto extends proto {
    //   constructor({ ...props }) {
    //     super({ ...props });
    //   }
    // }
    // NOTE 2019.04.02, 18:21 -- Old buggy code
    // entityClass = function dummyProto({ ...props }) {
    //   return this.__proto__.constructor({ ...props });
    // };
    // entityClass.prototype = Object.create(proto.prototype);
    // Object.setPrototypeOf(entityClass, proto); // Polyfill?

    // Declare & store prototype
    if (isElem) {
      this.declElem(entityClass);
    }
    else {
      this.declBlock(entityClass);
    }

    return entityClass;

  },

  /** Hydrate one entity (class) on the specified dom element
   * @param {jQuery} domElem
   * @param {string} entityName
   * @return {object|undefined} entityInstance
   */
  hydrateDomElemEntity: function(domElem, entityName) {

    // Do we have an entity description?
    const entityClass = this.getOrCreateEntityClass(entityName);

    // If found prototype class...
    if (entityClass) {

      // Get entity params
      const bemData = domElem.data('bem') || {};
      const params = bemData[entityName] || {};

      // const block = entityClass.block;
      // const entityName = utils.getEntityName(entityClass);

      const props = {
        entityClass,
        domElem,
        params,
        // entityName,
        entityName,
      };

      // Create entity instance with fetched params
      // const instance = new entityClass({ ...props });
      const instance = new entityClass(props);

      const bemInstances = domElem.data('bemInstances') || {};
      bemInstances[entityName] = instance;
      domElem.data('bemInstances', bemInstances);

      // Return entity instance
      return instance;

    }

  },
  /** Find and reanimate (hydrate) all existing {jsClass} instances on specified dom element
   * @param {jQuery} domElem
   * @return {jQuery} domElem
   */
  hydrateDomElem: function(domElem) {

    // Get data-bem property on specified dom
    const bemData = domElem.data('bem');

    // Get data-bem keys (block names)
    const domEntities = (bemData && Object.keys(bemData)) || [];

    // Walk thru all found instances...
    // const entities =
    domEntities
      .filter(entityName => {
        return domElem.hasClass(entityName);
      })
      .map(entityName => {
        return this.hydrateDomElemEntity(domElem, entityName);
      })
    ;

    return domElem;

  },

  /** Fetch mods from entity css classes
   * @param {BemEntity} instance
   * @return {object[]}
   */
  getEntityInstanceDomMods: function(instance) {
    const entityName = instance.getEntityName();
    const modPrefix = entityName + modDelim;
    const classesList = instance.domElem[0].className.split(/\s+/);
    const modsToSet = classesList
      .map((className) => {
        if (className.startsWith(modPrefix)) {
          const props = utils.parseDomEntityName(className);
          return props;
        }
      })
      .filter(o => o) // Remove empty entries
    ;
    return modsToSet;
  },

  /** Initialize dom elem entity
   * @param {jQuery} domElem
   * @param {string|object} entityName
   * @return {BemEntity}
   */
  initDomElemEntity: function(domElem, entityName) {
    if (typeof entityName === 'object') {
      entityName = utils.getEntityClassName(entityName);
    }
    const bemInstances = domElem.data('bemInstances') || {};
    const instance = bemInstances[entityName];
    if (instance.__inited != null) {
      // throw?
      // console.error('Cyclic initialization', entityName, instance); // eslint-disable-line no-console
      // /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      return instance;
    }
    instance.__inited = false;
    // Lifecycle: beforeInit
    if (typeof instance.beforeInit === 'function') {
      instance.beforeInit();
    }
    // Mods to set
    // TODO: Which mods must come first? -- `js` or all other?
    const instanceMods = this.getEntityInstanceDomMods(instance);
    const modsToSet = [{ modName: 'js', modVal: 'inited' }]
      .concat(instanceMods);
    // Set mods...
    modsToSet.map(({ modName, modVal }) => {
      instance.setMod(modName, modVal);
    });
    // Account instance
    this.instances.push(instance);
    instance.__inited = true;
    // Lifecycle: onInit
    if (typeof instance.onInit === 'function') {
      instance.onInit();
    }
    // TODO: To remove (replace with `onInit`)?
    if (typeof instance.afterInit === 'function') {
      setTimeout(instance.afterInit.bind(instance), 0);
    }
    return instance;
  },
  /** Initialize entities created on given dom node (via `hydrateDomElem` or `hydrateDomElemEntity`)
   * @param {jQuery} domElem
   * @return {BemEntity[]}
   */
  initDomElem: function(domElem) {
    const bemInstances = domElem.data('bemInstances') || {};
    const domEntities = bemInstances && Object.keys(bemInstances) || [];
    const entities = domEntities.map((entityName) => {
      return this.initDomElemEntity(domElem, entityName);
    });
    return entities;
  },

  /**
   * @param {jQuery} [parent=$(document.body)]
   * @return {BemEntity[]|undefined}
   */
  hydrate: function(parent) {

    // DOM root element to hydrate
    parent = (parent && parent.length != null) ? parent : $('body');

    // Find all {jsClass} enabled dom elements...
    const jsBemClass = '.' + jsClass + '[data-bem]';
    let domElems = [];
    // NOTE 2019.03.25, 00:40 -- Map ensure passing JQueryColletion with multiple elements
    parent.map((_n, dom) => {
      const domElem = $(dom);
      const found = Array.from(domElem.find(jsBemClass)).map(elem => $(elem));
      if (domElem.hasClass(jsClass) && domElem.attr('data-bem')) {
        found.unshift(domElem);
      }
      domElems = domElems.concat(found);
    });
    if (domElems.length) {
      // Walk thru all found elements...
      const entities = domElems
        // Hydrate...
        .map(domElem => {
          return this.hydrateDomElem(domElem);
        })
        // ...And initialize...
        .map(domElem => {
          return this.initDomElem(domElem);
        })
      ;
      return entities; // ???
    }

    // return [];

  },

  // Destroy...

  /** Destroy bem instance on DOM node
   * @param {jQuery} domElem
   * @param {string|object} entityName
   * @return {domElem}
   */
  destroyDomElemEntity: function(domElem, entityName) {
    if (typeof entityName === 'object') {
      entityName = utils.getEntityClassName(entityName);
    }
    const bemInstances = domElem.data('bemInstances') || {};
    const instance = bemInstances[entityName];
    if (instance && !instance.__destroying) {
      instance.__destroying = true;
      if (typeof instance.beforeDestroy === 'function') {
        instance.beforeDestroy();
      }
      if (typeof instance.onDestroy === 'function') {
        instance.onDestroy();
      }
      instance.delMod('js', 'inited');
      delete bemInstances[entityName];
      var p = this.instances.indexOf(instance);
      if (p !== -1) {
        this.instances.splice(p, 1);
      }
      // Unaccounted instance?
      else {
        const error = new Error('BEMDOM: Unaccounted instance');
        console.error(error); // eslint-disable-line no-console
        /*DEBUG*/ debugger; // eslint-disable-line no-debugger
        throw error;
      }
      domElem.data('bemInstances', bemInstances);
      if (typeof instance.afterDestroy === 'function') {
        instance.afterDestroy();
      }
    }
    return domElem;
  },

};

/** Add jQuery method: Initialize or get initialized bem instance for dom node and entity name
 * @param {string|object} entityName
 */
$.fn.bem = function(entityName) {
  const domElem = this; // $(this);
  let instance;
  if (domElem && domElem.length) {
    if (typeof entityName === 'object') {
      entityName = utils.getEntityClassName(entityName);
    }
    const bemInstances = domElem.data('bemInstances') || {};
    instance = bemInstances[entityName];
    if (!instance) {
      BEMDOM.hydrateDomElemEntity(domElem, entityName);
      instance = BEMDOM.initDomElemEntity(domElem, entityName);
    }
  }
  return instance;
};
