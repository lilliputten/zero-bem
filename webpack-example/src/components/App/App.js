/** @module App
 *  @since 2019.06.26, 11:17
 *  @changed 2019.06.26, 11:17
 */

const { BEMDOM, BEMHTML } = require('zero-bem');

require('components/Demo');

// Own technologies...

require('./App.bemhtml');
require('./App.pcss');

/** Demo iterations timeout */
const demoDelayTimeout = 2000;

const App_proto = /** @lends App.prototype */ {

  /** (Utility) Return delayed promise
   * @param {*} [result] - Value to resolve
   * @param {Number} [timeout] - Delay timeout
   * @return {Promise}
   */
  delayPromise: function(result, timeout = demoDelayTimeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout, result);
    });
  },

  /** Place text content into `Info` element
   * @param {String} text
   */
  setInfo: function(text) {
    this.infoElem && BEMDOM.update(this.infoElem, text);
  },

  /** Place text content into `Info` element and return delayed promise
   * @param {String} text
   * @return {Promise}
   */
  delayInfoPromise: function(text) {
    this.setInfo(text);
    return this.delayPromise(text);
  },

  /** Dynamically add info element
   * @return {Promise}
   */
  addInfoElem: function() {
    // Element template
    const template = {
      block: this.block,
      elem: 'Info',
      content: '...some info comes here...',
    };
    // Creating html
    const html = BEMHTML.apply(template);
    // Container to add children
    const containerElem = this._elem('Container');
    // Add to dom
    const dom = BEMDOM.append(containerElem, html);
    // Get created entity
    const infoElem = dom.bem({ block: this.block, elem: 'Info' });
    // Store element entity
    this.infoElem = infoElem;
  },

  /** Dynamically add info element
   * @return {Promise}
   */
  startDemoPromise: function () {
    // Init component
    this.addInfoElem();
    // Set info text & return promise
    return this.delayInfoPromise('Info element was created');
  },

  addDemoBlock: function() {

    // Try to dynamically create blocks from template
    const template = {
      block: 'Demo',
      mix: {
        block: 'Mixed',
        mods: { test: 'val' },
        js: { param: 1 },
      },
      mods: { test: true },
      content: [
        { elem: 'Text', content: 'Demo text content' },
        { elem: 'Button', modName: 'id', modVal: 'action', content: 'Demo action' },
      ],
    };

    // Create html from template
    const html = BEMHTML.apply(template);

    // Container to add children
    const containerElem = this._elem('Container');

    // Add dom node
    const dom = BEMDOM.append(containerElem, html);

    // Get bem entity
    const demoBlock = dom.bem('Demo');

    // Get mixed block
    const mixedBlock = demoBlock.findMixedBlock({ block: 'Mixed', modName: 'test', modVal: 'val' });
    console.log('Mixed block params:', mixedBlock.params); // eslint-disable-line no-console

    mixedBlock.setMod('alreadyFound');

    // Find child
    const buttonElem = demoBlock.findChildElem('Button');
    console.log('Button element id:', buttonElem.getMod('id')); // eslint-disable-line no-console

    buttonElem.setMod('alreadyFound');

    return this.delayInfoPromise('Demo block was added');

  },

  removeDemoBlock: function() {

    // Find demo block
    const demoBlock = this.findChildBlock('Demo');

    // Remove created node & all linked & nested bem entities (Demo itself, all mixes, siblings and children)
    demoBlock && BEMDOM.remove(demoBlock);

    return this.delayInfoPromise('Demo block was removed');

  },

  modifyWrapperBlock: function() {

    // Find parent block
    const wrapperBlock = this.findParentBlock('Wrapper');

    // Set modifier
    wrapperBlock && wrapperBlock.setMod('alreadyFound');

    return this.delayInfoPromise('Wrapper block was modified');

  },

  /** Initialize the app event handler
   */
  onInit: function() {

    this.__base();

    // Show app params
    console.log('App:onInit: params', this.params); // eslint-disable-line no-console

    // Make tests...
    this.startDemoPromise()
      .then(() => this.addDemoBlock())
      .then(() => this.modifyWrapperBlock())
      .then(() => this.removeDemoBlock())
      .then((result) => {
        const msg = 'Demo done';
        console.log(msg, result); // eslint-disable-line no-console
        // [>DEBUG<] debugger; // eslint-disable-line no-debugger
        this.setInfo(msg);
      })
      .catch((error) => {
        console.error('App:onInit: demo error', error); // eslint-disable-line no-console
        /*DEBUG*/ debugger; // eslint-disable-line no-debugger
        this.setInfo('Error: ' + String(error));
      })
    ;
  },

};

export default BEMDOM.declBlock('App', App_proto);
