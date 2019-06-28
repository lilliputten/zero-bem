/* eslint-env jest, es6, node, browser */
/* eslint-disable no-console */

// Project environment required in code
process.env.THEME = 'default';
process.env.THEME_FILE = './themes/' + process.env.THEME;

// NOTE: Mock unimplemented in jest/jsdom window methods...

// window.alert = (msg) => { console.log(msg); };
// window.matchMedia = () => ({});
window.scrollTo = () => {};

// jquery
// eslint-disable-next-line no-unused-vars
const $ = window.jQuery = window.$ = require('jquery');
