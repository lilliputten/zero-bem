/** @module config
 *  @since 2019.03.14, 09:31
 *  @changed 2019.03.16, 00:19
 */

/* @see `i-bem__internal.vanilla.js` from `bem-core`
 *
 * ```js
 *   BEM_CLASS_NAME = 'i-bem',
 *   BEM_SELECTOR = '.' + BEM_CLASS_NAME,
 *   BEM_PARAMS_ATTR = 'data-bem',
 *
 *   NAME_PATTERN = bemInternal.NAME_PATTERN,
 *
 *   MOD_DELIM = bemInternal.MOD_DELIM,
 *   ELEM_DELIM = bemInternal.ELEM_DELIM,
 *
 *   buildModPostfix = bemInternal.buildModPostfix,
 *   buildClassName = bemInternal.buildClassName,
 * ```
 */

export const config = {

  elemDelim: '__', // bemInternal.ELEM_DELIM,
  modDelim: '_', // bemInternal.MOD_DELIM,
  modValDelim: '_',

  jsClass: 'bem-js', // 'i-bem',

};
