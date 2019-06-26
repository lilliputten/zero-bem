"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BEMDOM = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** @module BEMDOM
 *  @description BEMDOM
 *  @since 2019.03.09, 22:54
 *  @changed 2019.04.03, 22:16
 *
 *  TODO:
 *    - 2019.03.14, 22:41 -- To ensure not to twice hydrating/initialing dom/entity?
 */
var inherit = require('inherit'); // const objects = require('lib/objects').default;


var $ = window && window.$ || require('jquery');

var _require = require('./config'),
    config = _require.config;

var _require2 = require('./utils'),
    utils = _require2.utils;

var modDelim = config.modDelim,
    jsClass = config.jsClass;
var BEMDOM =
/** @lends BEMDOM */
{
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
  injectContent: function injectContent(method, parent, html) {
    // If BemEntity, get jQueryCollection...
    if (parent.domElem) {
      parent = parent.domElem;
    } // Check error


    if (typeof parent[method] !== 'function') {
      var error = new Error('BEMDOM: injectContent: jQuery method is absent: ' + method);
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    }

    var domObj;

    if (typeof html === 'string') {
      // Catching jquery exception on trying to create dom entity for plain string
      try {
        domObj = $(html);
      } catch (e) {// Pass thru
      }
    } else {
      domObj = html;
    } // Create dom objects...


    if (domObj && domObj.length) {
      parent[method](domObj);
      this.hydrate(domObj);
    } // Create raw content
    else {
        parent[method](html);
      }

    return domObj;
  },

  /** Append content to dom
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   */
  append: function append(parent, html) {
    return this.injectContent('append', parent, html);
  },

  /** Append content to dom
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   */
  prepend: function prepend(parent, html) {
    return this.injectContent('prepend', parent, html);
  },
  // TODO: replace

  /** Replace dom element content
   * @param {jQuery|BemEntity} parent
   * @param {string|jQuery} html
   */
  replace: function replace(parent, html) {
    // Cleanup current dom entities
    this.remove(parent, {
      remainSelf: true
    }); // ...and replace it...

    return this.injectContent('replaceWith', parent, html);
  },

  /** Replace all previous content with new specified
   * @param {jQuery|BemEntity} domElem
   * @param {string|jQuery} html
   */
  update: function update(domElem, html) {
    var _this = this;

    if (domElem) {
      domElem = domElem.domElem || domElem;
      var children = domElem.children();
      children.map(function (_n, childElem) {
        _this.remove($(childElem));
      }); // Remove plain html

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
  remove: function remove(domElem, opt) {
    var _this2 = this;

    opt = opt || {};

    if (domElem) {
      // BemEntity?
      domElem = domElem.domElem || domElem; // Raw DOM object? -> jQuery object

      if (domElem.tagName) {
        domElem = $(domElem);
      }

      var bemInstances = domElem.data('bemInstances') || {};
      var domEntities = bemInstances && Object.keys(bemInstances) || []; // Destroy all DOM entities...

      if (domEntities && domEntities.length) {
        domEntities.map(function (entityName) {
          return _this2.destroyDomElemEntity(domElem, entityName);
        });
      } // Find DOM childs...


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
  declBlock: function declBlock(block, base, props, staticProps) {
    var blockClass = block;
    var entityName = block; // Inheriting from props/staticProps

    if (typeof block === 'string') {
      // No base? -- Use BemBlock as proto, shift all other args
      if (_typeof(base) === 'object' && !Array.isArray(base)) {
        staticProps = props;
        props = base;
        base = this.BemBlockProto;
      } // Base: add BemBlock as first inheritance element
      else {
          if (!Array.isArray(base)) {
            base = [base];
          }

          base.unshift(this.BemBlockProto);
        } // Creating inherited class


      blockClass = inherit(base, props, staticProps || {
        block: entityName
      });
      /*DEBUG*/

      blockClass.__name = entityName;
    } // Esle -- already inherited class -- fetch name
    else if (typeof block === 'function') {
        entityName = blockClass.block;
      } // Throw error for invalid block parameter?
    // TODO: To redefine class???


    if (this.entitiesRegistry[entityName]) {
      var error = new Error('BEMDOM: Block already defined: ' + entityName);
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    }

    this.entitiesRegistry[entityName] = {
      entityClass: blockClass
    };
    return blockClass;
  },

  /**
   * @param {object} elemClass
   * @return {object} elemClass
   */
  declElem: function declElem(elemClass) {
    var block = elemClass.block,
        elem = elemClass.elem;
    var entityName = utils.getEntityClassName({
      block: block,
      elem: elem
    });

    if (this.entitiesRegistry[entityName]) {
      var error = new Error('BEMDOM: Block elem already defined: ' + entityName);
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    }

    this.entitiesRegistry[entityName] = {
      entityClass: elemClass
    };
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
  declMod: function declMod(base, mod, props, staticProps) {
    props && utils.convertModHandlersToMethods(props);
    var checkMod = utils.buildCheckMod(mod.modName, mod.modVal);
    var basePtp = base.prototype; // objects.each(props, function(prop, name) {
    // Object.entries(props).forEach(function([name, prop]) {

    Object.keys(props).forEach(function (name) {
      var prop = props[name];

      if (typeof prop === 'function') {
        props[name] = function () {
          var method;

          if (checkMod(this)) {
            method = prop;
          } else {
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
  findEntities: function findEntities(_ref) {
    var _this3 = this;

    var select = _ref.select,
        domElem = _ref.domElem,
        block = _ref.block,
        elem = _ref.elem,
        modName = _ref.modName,
        modVal = _ref.modVal;

    if (!domElem) {
      var error = new Error('BEMDOM: domElem not specified');
      console.error(error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw error;
    }

    if (!block) {
      var _error = new Error('BEMDOM: Property `block` not specified');

      console.error(_error); // eslint-disable-line no-console

      /*DEBUG*/

      debugger; // eslint-disable-line no-debugger

      throw _error;
    } // select = select || 'find';


    var results = [];
    var entityName = utils.getEntityName({
      block: block,
      elem: elem
    });
    var className = utils.getEntityClassName({
      block: block,
      elem: elem,
      modName: modName,
      modVal: modVal
    });
    var jqResults = utils.findDomEntities(select || 'find', domElem, className);
    jqResults.map(function (_n, dom) {
      var entityDomElem = $(dom);
      var bemInstances = entityDomElem.data('bemInstances') || [];
      var instance = bemInstances[entityName];

      if (!instance) {
        instance = _this3.hydrateDomElemEntity(entityDomElem, entityName);
      }

      if (instance && !instance.wasInited()) {
        _this3.initDomElem(entityDomElem);
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
  getEntityClassName: function getEntityClassName(props) {
    return utils.getEntityClassName(props);
  },

  /**
   * @param {string|BemEntity} entity
   * @param {object} [options]
   * @param {string} [options.prefix='uniq_']
   * @param {string} [options.postfix='']
   * @return {string}
   */
  getUniqueId: function getUniqueId(entity, options) {
    // Default options...
    options = Object.assign({
      prefix: 'uniq_',
      postfix: ''
    }, options); // Create id

    var id = options.prefix + this.getEntityClassName(entity) + options.postfix; // Get current count

    var uniqueIdCount = this._uniqueIds[id] || 0; // Update next value (and current id number)

    var nextUniqueIdCount = this._uniqueIds[id] = uniqueIdCount + 1; // Create unique id

    if (uniqueIdCount) {
      id += '_' + nextUniqueIdCount;
    }

    return id;
  },
  // Instances...

  /**
   * @return {number}
   */
  getInstancesCount: function getInstancesCount() {
    return this.instances.length;
  },

  /**
   * @return {number}
   */
  getInstancesInfo: function getInstancesInfo() {
    return this.instances.map(function (item
    /* , n */
    ) {
      return item.getEntityName() + ': ' + item.getId(); // return {
      //   name: item.getEntityName(),
      //   id: item.getId(),
      // };
    });
  },
  // Hydrate methods...

  /**
   */
  getOrCreateEntityClass: function getOrCreateEntityClass(entityName) {
    // Try to get existing prototype
    var entityClass = this.entitiesRegistry[entityName] && this.entitiesRegistry[entityName].entityClass; // Found?

    if (entityClass) {
      return entityClass;
    } // If not found, then crate new one...
    // Get bem props (block, elem, mod...)


    var bemProps = utils.parseDomEntityName(entityName); // Block or elem?

    var isElem = !!bemProps.elem;
    var proto = isElem ? this.BemElemProto : this.BemBlockProto; // Create and store entity proto dynamically

    entityClass = inherit(proto, {});
    Object.assign(entityClass, bemProps); // entityClass = _cls_ dummyProto extends proto {
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
    } else {
      this.declBlock(entityClass);
    }

    return entityClass;
  },

  /** Hydrate one entity (class) on the specified dom element
   * @param {jQuery} domElem
   * @param {string} entityName
   * @return {object|undefined} entityInstance
   */
  hydrateDomElemEntity: function hydrateDomElemEntity(domElem, entityName) {
    // Do we have an entity description?
    var entityClass = this.getOrCreateEntityClass(entityName); // If found prototype class...

    if (entityClass) {
      // Get entity params
      var bemData = domElem.data('bem') || {};
      var params = bemData[entityName] || {}; // const block = entityClass.block;
      // const entityName = utils.getEntityName(entityClass);

      var props = {
        entityClass: entityClass,
        domElem: domElem,
        params: params,
        // entityName,
        entityName: entityName
      }; // Create entity instance with fetched params
      // const instance = new entityClass({ ...props });

      var instance = new entityClass(props);
      var bemInstances = domElem.data('bemInstances') || {};
      bemInstances[entityName] = instance;
      domElem.data('bemInstances', bemInstances); // Return entity instance

      return instance;
    }
  },

  /** Find and reanimate (hydrate) all existing {jsClass} instances on specified dom element
   * @param {jQuery} domElem
   * @return {jQuery} domElem
   */
  hydrateDomElem: function hydrateDomElem(domElem) {
    var _this4 = this;

    // Get data-bem property on specified dom
    var bemData = domElem.data('bem'); // Get data-bem keys (block names)

    var domEntities = bemData && Object.keys(bemData) || []; // Walk thru all found instances...
    // const entities =

    domEntities.filter(function (entityName) {
      return domElem.hasClass(entityName);
    }).map(function (entityName) {
      return _this4.hydrateDomElemEntity(domElem, entityName);
    });
    return domElem;
  },

  /** Fetch mods from entity css classes
   * @param {BemEntity} instance
   * @return {object[]}
   */
  getEntityInstanceDomMods: function getEntityInstanceDomMods(instance) {
    var entityName = instance.getEntityName();
    var modPrefix = entityName + modDelim;
    var classesList = instance.domElem[0].className.split(/\s+/);
    var modsToSet = classesList.map(function (className) {
      if (className.startsWith(modPrefix)) {
        var props = utils.parseDomEntityName(className);
        return props;
      }
    }).filter(function (o) {
      return o;
    }) // Remove empty entries
    ;
    return modsToSet;
  },

  /** Initialize dom elem entity
   * @param {jQuery} domElem
   * @param {string|object} entityName
   * @return {BemEntity}
   */
  initDomElemEntity: function initDomElemEntity(domElem, entityName) {
    if (_typeof(entityName) === 'object') {
      entityName = utils.getEntityClassName(entityName);
    }

    var bemInstances = domElem.data('bemInstances') || {};
    var instance = bemInstances[entityName];

    if (instance.__inited != null) {
      // throw?
      // console.error('Cyclic initialization', entityName, instance); // eslint-disable-line no-console
      // /*DEBUG*/ debugger; // eslint-disable-line no-debugger
      return instance;
    }

    instance.__inited = false; // Lifecycle: beforeInit

    if (typeof instance.beforeInit === 'function') {
      instance.beforeInit();
    } // Mods to set
    // TODO: Which mods must come first? -- `js` or all other?


    var instanceMods = this.getEntityInstanceDomMods(instance);
    var modsToSet = [{
      modName: 'js',
      modVal: 'inited'
    }].concat(instanceMods); // Set mods...

    modsToSet.map(function (_ref2) {
      var modName = _ref2.modName,
          modVal = _ref2.modVal;
      instance.setMod(modName, modVal);
    }); // Account instance

    this.instances.push(instance);
    instance.__inited = true; // Lifecycle: onInit

    if (typeof instance.onInit === 'function') {
      instance.onInit();
    } // TODO: To remove (replace with `onInit`)?


    if (typeof instance.afterInit === 'function') {
      setTimeout(instance.afterInit.bind(instance), 0);
    }

    return instance;
  },

  /** Initialize entities created on given dom node (via `hydrateDomElem` or `hydrateDomElemEntity`)
   * @param {jQuery} domElem
   * @return {BemEntity[]}
   */
  initDomElem: function initDomElem(domElem) {
    var _this5 = this;

    var bemInstances = domElem.data('bemInstances') || {};
    var domEntities = bemInstances && Object.keys(bemInstances) || [];
    var entities = domEntities.map(function (entityName) {
      return _this5.initDomElemEntity(domElem, entityName);
    });
    return entities;
  },

  /**
   * @param {jQuery} [parent=$(document.body)]
   * @return {BemEntity[]|undefined}
   */
  hydrate: function hydrate(parent) {
    var _this6 = this;

    // DOM root element to hydrate
    parent = parent && parent.length != null ? parent : $('body'); // Find all {jsClass} enabled dom elements...

    var jsBemClass = '.' + jsClass + '[data-bem]';
    var domElems = []; // NOTE 2019.03.25, 00:40 -- Map ensure passing JQueryColletion with multiple elements

    parent.map(function (_n, dom) {
      var domElem = $(dom);
      var found = Array.from(domElem.find(jsBemClass)).map(function (elem) {
        return $(elem);
      });

      if (domElem.hasClass(jsClass) && domElem.attr('data-bem')) {
        found.unshift(domElem);
      }

      domElems = domElems.concat(found);
    });

    if (domElems.length) {
      // Walk thru all found elements...
      var entities = domElems // Hydrate...
      .map(function (domElem) {
        return _this6.hydrateDomElem(domElem);
      }) // ...And initialize...
      .map(function (domElem) {
        return _this6.initDomElem(domElem);
      });
      return entities; // ???
    } // return [];

  },
  // Destroy...

  /** Destroy bem instance on DOM node
   * @param {jQuery} domElem
   * @param {string|object} entityName
   * @return {domElem}
   */
  destroyDomElemEntity: function destroyDomElemEntity(domElem, entityName) {
    if (_typeof(entityName) === 'object') {
      entityName = utils.getEntityClassName(entityName);
    }

    var bemInstances = domElem.data('bemInstances') || {};
    var instance = bemInstances[entityName];

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
      } // Unaccounted instance?
      else {
          var error = new Error('BEMDOM: Unaccounted instance');
          console.error(error); // eslint-disable-line no-console

          /*DEBUG*/

          debugger; // eslint-disable-line no-debugger

          throw error;
        }

      domElem.data('bemInstances', bemInstances);

      if (typeof instance.afterDestroy === 'function') {
        instance.afterDestroy();
      }
    }

    return domElem;
  }
};
/** Add jQuery method: Initialize or get initialized bem instance for dom node and entity name
 * @param {string|object} entityName
 */

exports.BEMDOM = BEMDOM;

$.fn.bem = function (entityName) {
  var domElem = this; // $(this);

  var instance;

  if (domElem && domElem.length) {
    if (_typeof(entityName) === 'object') {
      entityName = utils.getEntityClassName(entityName);
    }

    var bemInstances = domElem.data('bemInstances') || {};
    instance = bemInstances[entityName];

    if (!instance) {
      BEMDOM.hydrateDomElemEntity(domElem, entityName);
      instance = BEMDOM.initDomElemEntity(domElem, entityName);
    }
  }

  return instance;
};
//# sourceMappingURL=BEMDOM.js.map