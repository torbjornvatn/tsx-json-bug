# tsx JSON bug reproduction

Minimal repo that proves a regression introduced in **tsx v4.21.1** where `.json` files
are incorrectly transformed as JavaScript, producing the error:

```
SyntaxError: …/statuses/codes.json: Unexpected token 'v', "var _00="C"... is not valid JSON
```

## What's in here

| File                 | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `src/status.ts`      | Imports `statuses` (which loads `codes.json` internally) |
| `src/status.test.ts` | Three `node:test` assertions that exercise `status.ts`   |

## Reproduce

```bash
npm install

# ✅ Passes with tsx@4.21.0
npm run test:good

# ❌ Fails with tsx@4.21.1
npm run test:bad
```

Both scripts run the **identical** test command, only the tsx version differs:

```
node --test-reporter spec --import=tsx[-good|-bad]/esm --test 'src/**/*.test.ts'
```

The error only occurs with Node version 24, if I run `nvm use 22` before `npm run test:bad`, the tests pass just fine.

## Why it breaks (this section is AI generate, so it might not be the actual reason)

`statuses` ships a plain JSON file (`node_modules/statuses/codes.json`).  
Starting in 4.21.1, tsx's ESM loader began applying its esbuild transform pipeline
to `.json` files. esbuild compiles JSON into a JS module (`var _00 = …`), but Node's
`--experimental-json-modules` / import assertions path then tries to re-parse the
_compiled output_ as raw JSON — and fails.
