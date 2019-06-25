# BEMHTML module

bem-xjst template engine.

## Usage:

To generate BEMHTML core, run `sh ./!generate.sh` in command line.

Using source diff patch `BEMHTML.js.diff`.

## Applying next changes to original code:

- Exposing library code to global scope.
- Modifying bem-able class name (classValue; not to `bem-js`, was classic `i-bem`).
- Changing template engine parameters (`{ elemJsInstances:true, exportName:'BEMHTML', to:'BEMHTML.js' }` -- animate elem node, library names).

## Required command line utils:

- dos2unix
- patch
- date
- node
