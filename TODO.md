# TODO

- 2019.06.25, 13:06 -- Resolve cyclic dependencies (`BEMDOM <- BemBlock, BemElem <- BemEntity <- BEMDOM`)
- 2019.06.25, 12:52 -- Use own `nano-events` instead of `event-lite`.
- 2019.06.25, 11:36 -- Publish webpack loader & jest transformers as separated packages?
- 2019.06.25, 11:14 -- Add bemhtml templates loader for webpack (now only dynamic generation supported).
- 2019.06.25, 11:13 -- `webpack-zero-bemhtml-loader` -- Transpile code with babel and create correct sourcemaps.
- 2019.06.25, 10:18 -- Configure to use global (preloaded) jquery module or our own module (via `require`).
- 2019.06.25, 09:36 -- Tests.
- 2019.03.10, 23:25 -- Get config options (eg, entity name delims) from `.bemrc`. (Pass thru webpack on build?)
- Implement `convertModHandlersToMethods` (`onSetMods: {}` => `onSetMod()`...) (see as in `bem-core`).
- Emit mod change events (already done, `onSetMod`, `beforeSetMod`?)
- Bem collections (?)
