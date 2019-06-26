/** @module index
 *  @description Main entry point
 *  @since 2019.06.26, 10:41
 *  @changed 2019.06.26, 10:41
 */

// jQuery
/* const $ = */ window.jQuery = window.$ = require('jquery');

// Import zero-bem
const { BEMDOM } = require('zero-bem');

// Main interface components...
require('components/App');

// Main styles...
require('./index.pcss');

try {

  // Autohydrate dryed bem entities
  BEMDOM.hydrate();

}
catch(error) {
  console.error(error); // eslint-disable-line no-console
  /*DEBUG*/ debugger; // eslint-disable-line no-debugger
}

// Catch top-level uncatched errors
if (typeof window ==='object') {
  window.onerror = function uncaughtError(msg, url, line) {
    console.error('Top-level uncatched error:', msg, url, line); // eslint-disable-line no-console
    /*DEBUG*/ debugger; // eslint-disable-line no-debugger
  };
}
