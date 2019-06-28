const $ = require('jquery')
const { BEMDOM, BemBlock } = require('./')

/* TODO:
 *   - @see [DOM Manipulation · Jest](https://jestjs.io/docs/en/tutorial-jquery)
 *
 * To check:
 *   - setMod
 *   - hasMod
 *   - getMod
 *   - delMod
 *   - findChildBlocks
 *   - findChildBlock
 *   - findChildElems
 *   - findChildElem
 *   - findMixedBlocks
 *   - findMixedBlock
 *   - findMixedElems
 *   - findMixedElem
 *   - findParentBlocks
 *   - findParentBlock
 *   - findParentElems
 *   - findParentElem
 *   - clearElemsCache
 *   - _elem
 *   - getModEntityName
 *   - getBlockName
 *   - getElemName
 *   - getId
 *   - getUniqueId
 *   - *events*
 */

describe('BEMDOM', () => {

  it('should expose an object', () => {
    expect(typeof BEMDOM).toBe('object')
  })

  describe('node hydrating', () => {

    let testNode, testBlock

    beforeAll(() => {
      document.body.innerHTML = '<div class="Test bem-js" data-bem=\'{"Test":{"test":true}}\'>initial content</div>'
      testNode = $('.Test')
      BEMDOM.hydrate()
    })

    afterAll(() => {
      document.body.innerHTML = ''
    })

    it('must operate on valid jquery object', () => {
      expect(testNode instanceof $).toBe(true)
    })

    it('should add `inited` modifier class', () => {
      const hasInitedMofifier = testNode.hasClass('Test_js_inited')
      expect(hasInitedMofifier).toBe(true)
    })

    it('must create valid block entity', () => {
      testBlock = testNode.bem('Test')
      expect(testBlock instanceof BemBlock).toBe(true)
    })

    describe('block entity must contain properties', () => {

      it('domElem', () => {
        expect(testBlock.domElem instanceof $).toBe(true)
      })

      it('entityName', () => {
        expect(testBlock.entityName).toBe('Test')
      })

      it('block', () => {
        expect(testBlock.block).toBe('Test')
      })

      it('params', () => {
        expect(typeof testBlock.params).toBe('object')
      })

      it('params content', () => {
        expect(testBlock.params).toEqual({ test: true })
      })

    })

    describe('block entity must contain methods', () => {

      it('wasInited', () => {
        expect(typeof testBlock.wasInited).toBe('function')
      })

      it('wasInited msu returns true', () => {
        expect(testBlock.wasInited()).toBe(true)
      })

      it('setMod', () => {
        expect(typeof testBlock.setMod).toBe('function')
      })

    })

  })

})
