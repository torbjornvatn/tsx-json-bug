# tsx CJS node_modules resolution bug reproduction

Minimal repo that proves a regression where tsx on **Node 24+** incorrectly applies
TypeScript extension resolution (`.js → .ts/.tsx/.jsx`) to `require()` calls made
*inside* `node_modules`, breaking CJS packages such as **superagent**.

```
Error: Cannot find module '.../mime-db/index.jsx'
    at Object.<anonymous> (.../superagent/lib/node/index.js:...)
```

Tracked in: [privatenumber/tsx#800](https://github.com/privatenumber/tsx/issues/800)  
Fixed by: [privatenumber/tsx#803](https://github.com/privatenumber/tsx/pull/803) (linked locally as `tsx-pr`)

## What's in here

| File                   | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `src/status.ts`        | Uses **superagent** (a CJS package) to `GET` a URL and return JSON  |
| `src/status.test.ts`   | Two `node:test` assertions — spins up a local HTTP server, no network needed |
| `../tsx-fix/`          | Local checkout of the PR branch (`imevanc/tsx-fix@fix/node-modules-extension-rewrite`), built and linked as `tsx-pr` |

## Reproduce

```bash
npm install

# ✅ Passes — tsx@4.21.0 (unaffected, before the regression window)
npm run test:good

# ❌ Fails — tsx@4.21.1 (regression introduced here)
npm run test:bad

# ❌ Fails — tsx@latest (still unfixed in the published release)
npm run test:latest

# ✅ Passes — tsx PR #803 (local build of the fix branch)
npm run test:pr
```

All scripts run the **same** test command, only the tsx version differs:

```
node --test-reporter spec --import=tsx[-good|-bad|-latest|-pr]/esm --test 'src/**/*.test.ts'
```

> **Note:** The failure only manifests on **Node 24+**.  Running `nvm use 22` before
> `npm run test:bad` makes the tests pass because on Node 22 CJS `require()` calls
> never go through the ESM hooks.

## Why it breaks

On Node 24, `module.registerHooks()` intercepts CJS `require()` calls through ESM
sync hooks.  When a CJS file inside `node_modules` does `require('./relative/path')`,
tsx's resolver applies `mapTsExtensions()`, probing `.ts/.tsx/.jsx` candidates.
`nextResolve` for each probe re-enters the hooks recursively and fails for every
extension — including the original `.js` — because Node's native CJS resolver can't
resolve these paths in the recursive hook context.

## The fix (PR #803)

In `createResolveSync`, early-return to Node's native resolver when:

1. The hook context is a CJS `require()` call,
2. the parent file is inside `node_modules`, and
3. the specifier is a relative file path.

This prevents tsx from ever trying to rewrite extensions for intra-`node_modules`
requires, which matches the behaviour on Node 22.

## Building `tsx-pr` locally

```bash
cd ../tsx-fix          # the cloned PR branch
pnpm install
pnpm build
# then back in this repo: npm install (picks up file:../tsx-fix)
```
