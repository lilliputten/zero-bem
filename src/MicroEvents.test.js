/** @module MicroEvents.test
 *  @since 2019.07.03, 09:40
 *  @changed 2019.07.03, 09:40
 *
 * TODO:
 *   -
 *     @see:
 *       - https://github.com/psfe/micro-event/blob/master/test.js
 */

const MicroEvents = require('./MicroEvents').default

describe('MicroEvents', () => {
  describe('Constructor', () => {
    const events = new MicroEvents()
    it('should be constructor function', () => {
      expect(typeof MicroEvents).toBe('function')
    })
    it('should create instance', () => {
      expect(events).toBeInstanceOf(MicroEvents)
    })
  })
  describe('Emitting', () => {
    let events
    beforeAll(() => {
      events = new MicroEvents()
    })
    it('on should not throw when callback empty', () => {
      expect(() => {
        events.on('foo')
      }).not.toThrow()
    })
    it('off should not throw with arbitrary arguments', () => {
      expect(() => {
        events.off('foo')
        events.off()
        events.off('foo', () => {})
      }).not.toThrow()
    })
    it('emit should not throw with arbitrary arguments', () => {
      expect(() => {
        events.emit('foo')
        events.emit('foo', () => {})
      }).not.toThrow()
    })
    it('should support chaining syntax', () => {
      expect(() => {
        events
          .on('foo')
          .off('foo')
          .emit('foo')
      }).not.toThrow()
    })
    it('should not conflict', () => {
      const events1 = new MicroEvents()
      const events2 = new MicroEvents()
      const spy = jest.fn()
      events1.on('foo', spy)
      events2.emit('foo')
      expect(spy).not.toBeCalled()
    })
    it('should pass parameters when emit', () => {
      const spy = jest.fn()
      events
        .on('foo', spy)
        .emit('foo', 'bar', 'coo')
      expect(spy).toHaveBeenCalledWith('bar', 'coo')
    })
  })
  describe('Triggering', () => {
    const events = new MicroEvents()
    beforeEach(() => {
      events.off() // Reset all handlers
      // events = new MicroEvents() // Create new object
    })
    it('should emit when registered', () => {
      const spy = jest.fn()
      events.on('foo', spy).emit('foo')
      expect(spy).toBeCalled()
    })
    it('should support multiple handlers for the same event', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      events
        .on('foo', spy1)
        .on('foo', spy2)
        .emit('foo')
      expect(spy1).toBeCalled()
      expect(spy2).toBeCalled()
    })
    it('should call event handlers in the reversed order of the registered', () => {
      let flag = 0
      const spy2 = jest.fn(() => {
        (flag === 0) && (flag = 1)
      })
      const spy1 = jest.fn(() => {
        (flag === 1) && (flag = 2)
      })
      events
        .on('foo', spy1)
        .on('foo', spy2)
        .emit('foo')
      expect(flag).toEqual(2)
      // expect(spy1).to.have.been.calledBefore(spy2)
    })
    it('should emit binded event', () => {
      const spy = jest.fn()
      events.on('foo', spy).emit('foo')
      expect(spy).toBeCalled()
    })
    it('should support off by event name', () => {
      const spy = jest.fn()
      events
        .on('foo', spy)
        .off('foo')
        .emit('foo')
      expect(spy).not.toBeCalled()
    })
    it('should support off all', () => {
      const spy = jest.fn()
      events
        .on('foo', spy)
        .off()
        .emit('foo')
      expect(spy).not.toBeCalled()
    })
    it('should support off by handler', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      events
        .on('foo', spy1)
        .on('foo', spy2)
        .off('foo', spy1)
        .emit('foo')
      events.emit('foo')
      expect(spy1).not.toBeCalled()
      expect(spy2).toBeCalled()
    })
  })
})
