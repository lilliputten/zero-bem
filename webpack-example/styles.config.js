/** @module style.config
 *  @description Common styles defintions
 *  @since 2019.06.26, 16:08
 *  @changed 2019.06.26, 16:08
 */

const defaultFontSize = 20;

module.exports = {

  // DEBUG

  testColor: 'blue',

  // Fonts

  defaultFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  defaultFontSize: defaultFontSize,
  fontSize: defaultFontSize,
  fontSizeM: defaultFontSize,
  fontSizeSm: defaultFontSize - 2,
  fontSizeXs: defaultFontSize - 4,
  fontSizeLg: defaultFontSize + 2,
  fontSizeXl: defaultFontSize + 4,
  fontSizeXxl: defaultFontSize + 8,
  titleFontSize: defaultFontSize + 8,
  defaultLineHeight: 1.6,
  defaultFontWeight: 400,

  // Accent colors

  successColor: 'green',
  errorColor: 'red',
  selectColor: '#05b',

  // Neutral colors...

  neutralExtraDarkColor: '#666',
  neutralDarkColor: '#999',
  neutralColor: '#ccc',
  neutralLightColor: '#e0e0e0',
  neutralExtraLightColor: '#f0f0f0',

  // Spacings & paddings...

  innerPadding: 5,
  itemPadding: 10,
  containerPadding: 15,
  blockPadding: 20,

};
