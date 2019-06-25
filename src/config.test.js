const { config } = require('./config')

describe('config', () => {

  it('should expose an object', () => {
    expect(typeof config).toBe('object')
  })

  describe('should expose some string constants',() => {

    it('elemDelim', () => {
      expect(typeof config.elemDelim).toBe('string')
    })
    it('modDelim', () => {
      expect(typeof config.modDelim).toBe('string')
    })
    it('modValDelim', () => {
      expect(typeof config.modValDelim).toBe('string')
    })
    it('jsClass', () => {
      expect(typeof config.jsClass).toBe('string')
    })

  })

})
