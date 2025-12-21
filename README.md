# template-typescript-lib

[![trunk](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yaml/badge.svg)](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yaml)

Project template for TypeScript libraries optimized for tree-shaking.

## Features

- ESM-only with proper [`exports`](https://nodejs.org/api/packages.html#exports) configuration
- Tree-shaking optimized (see [Tree Shaking](#tree-shaking))
- Types: TypeScript via [tsgo](https://github.com/nicolo-ribaudo/tsgo)
- Tests: [Vitest](https://vitest.dev)
- Linting: [oxlint](https://oxc.rs/docs/guide/usage/linter) + [actionlint](https://github.com/rhysd/actionlint)
- Formatting: [dprint](https://dprint.dev)
- Package validation: [publint](https://publint.dev) + [attw](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
- Publishing: [Dripip](https://github.com/prisma-labs/dripip)
- CI: GitHub Actions

## Quick Start

```sh
corepack enable
```

### GitHub Template

```sh
gh repo create mylib --template jasonkuhrt/template-typescript-lib --clone --public && \
cd mylib && \
pnpm install && \
pnpm bootstrap
```

Then [setup a repo secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) called `NPM_TOKEN` for CI publishing.

### Manual Clone

```sh
gh repo clone jasonkuhrt/template-typescript-lib mylib && \
cd mylib && \
pnpm install && \
pnpm bootstrap
```

## Tree Shaking

This template is configured for aggressive tree-shaking. Bundlers (webpack, esbuild, rollup, vite) can eliminate unused code when consumers import from your library.

### Configuration

| Field                                                                                          | Value                 | Purpose                                |
| ---------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------- |
| [`type`](https://nodejs.org/api/packages.html#type)                                            | `"module"`            | ESM output (required for tree-shaking) |
| [`sideEffects`](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) | `false`               | Tells bundlers all modules are pure    |
| [`exports`](https://nodejs.org/api/packages.html#exports)                                      | Explicit entry points | Black-boxes package internals          |

### TypeScript Settings

| Option                                                                                 | Purpose                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax) | Preserves ES module syntax for bundlers                 |
| [`isolatedModules`](https://www.typescriptlang.org/tsconfig#isolatedModules)           | Ensures code is compatible with single-file transpilers |

### Validation

Two tools validate your package works correctly for consumers:

- **[publint](https://publint.dev)** - Checks packaging for compatibility across environments
- **[attw](https://arethetypeswrong.github.io)** - Checks TypeScript types resolve correctly across module resolution modes

Run both with `pnpm check`.

### Code Patterns

#### Prefer named exports

Named exports tree-shake more reliably than default exports. Default exports can cause issues with [CommonJS interop](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseExportDefault.md).

```ts
// Preferred
export const foo = () => {}
export const bar = () => {}

// Avoid
export default { foo, bar }
```

#### Pure annotations

For module-level function calls (HOCs, factories), the [`/*#__PURE__*/`](https://webpack.js.org/guides/tree-shaking/#mark-a-function-call-as-side-effect-free) annotation tells bundlers the call is side-effect free. See [Terser](https://github.com/terser/terser#annotations) and [UglifyJS](https://github.com/nicolo-ribaudo/uglify-js#annotations) docs.

### sideEffects

Bundlers cannot always statically determine if code has side effects. The `sideEffects` field [hints to bundlers](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) that your modules are "pure" and safe to prune if unused.

**Important**: If you add modules with side effects (e.g., CSS imports, polyfills, or code that runs on import), update `sideEffects` to an array:

```json
{
  "sideEffects": ["./src/polyfill.js", "**/*.css"]
}
```

### Barrel Files

[Barrel files](https://basarat.gitbook.io/typescript/main-1/barrel) (index.ts files that re-export from other modules) can [inhibit tree-shaking](https://github.com/vercel/next.js/issues/12557) in some bundlers. This template uses a single entry point which is acceptable for small libraries.

For larger libraries, consider:

- Multiple entry points via `exports` field
- Avoiding deep re-export chains
- Testing your bundle size with [bundlephobia](https://bundlephobia.com) or [pkg-size](https://pkg-size.dev)

### References

- [Webpack Tree Shaking Guide](https://webpack.js.org/guides/tree-shaking/)
- [Tree-Shaking: A Reference Guide (Smashing Magazine)](https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/)
- [package.json exports field (Node.js)](https://nodejs.org/api/packages.html#exports)
- [Building TypeScript Libraries (Arrange Act Assert)](https://arrangeactassert.com/posts/building-typescript-libraries/)
- [Are The Types Wrong?](https://arethetypeswrong.github.io)

## Details

<!-- toc -->

- [TypeScript](#typescript)
- [Linting](#linting)
- [Testing](#testing)
- [Formatting](#formatting)
- [npm Scripts](#npm-scripts)
- [CI](#ci)
- [Zed Settings](#zed-settings)

<!-- tocstop -->

### TypeScript

- Strict settings via [`@tsconfig/strictest`](https://github.com/tsconfig/bases)
- Node 22 target via [`@tsconfig/node22`](https://github.com/tsconfig/bases)
- Build cache in `node_modules/.cache`
- Output includes `declaration`, `declarationMap`, `sourceMap` for optimal consumer DX
- Source published for go-to-definition support

### Linting

- [oxlint](https://oxc.rs/docs/guide/usage/linter): Rust-based, ~100x faster than ESLint
- [actionlint](https://github.com/rhysd/actionlint): GitHub Actions workflow validation

### Testing

[Vitest](https://vitest.dev) - fast, ESM-native test runner.

### Formatting

[dprint](https://dprint.dev) - fast Rust-based formatter.

### npm Scripts

Parallel execution via pnpm pattern matching:

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `check`         | Run all checks in parallel               |
| `check:format`  | Verify formatting                        |
| `check:lint`    | Run oxlint                               |
| `check:types`   | Type check with tsgo                     |
| `check:package` | Validate package with publint            |
| `check:exports` | Validate exports with attw               |
| `check:ci`      | Lint GitHub Actions workflows            |
| `fix`           | Run all fixes in parallel                |
| `fix:format`    | Fix formatting                           |
| `fix:lint`      | Auto-fix lint issues                     |
| `build`         | Build with tsgo                          |
| `test`          | Run tests                                |

### CI

**PR workflow:**

- actionlint, format, lint, types, publint checks
- Tests on ubuntu/macos/windows, Node 22

**Trunk workflow:**

- Automated canary release via [Dripip](https://github.com/prisma-labs/dripip)

### Zed Settings

Configure [tsgo](https://zed.dev/extensions/tsgo) globally in `~/.config/zed/settings.json`:

```json
{
  "languages": {
    "TypeScript": {
      "language_servers": ["tsgo", "!vtsls", "oxc"]
    }
  }
}
```

---

![Repobeats](https://repobeats.axiom.co/api/embed/3c932f1cb76da4ad21328bfdd0ad1c6fbbe76a0b.svg)
