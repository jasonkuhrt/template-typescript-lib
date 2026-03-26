# template-typescript-lib

[![trunk](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yaml/badge.svg)](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yaml)

Project template for TypeScript libraries built with [Effect](https://effect.website), optimized for tree-shaking and agentic engineering.

## Features

- ESM-only with proper [`exports`](https://nodejs.org/api/packages.html#exports) configuration
- Tree-shaking optimized (see [Tree Shaking](#tree-shaking))
- [Effect](https://effect.website) as peer dependency
- Types: [tsgo](https://github.com/nicolo-ribaudo/tsgo) (Go-based TypeScript compiler)
- Tests: [bun test](https://bun.sh/docs/cli/test) with 90% coverage gating
- Linting: [oxlint](https://oxc.rs/docs/guide/usage/linter) (type-aware) + [actionlint](https://github.com/rhysd/actionlint)
- Formatting: [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- Package validation: [publint](https://publint.dev) + [attw](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
- Publishing: [Dripip](https://github.com/prisma-labs/dripip)
- CI: GitHub Actions
- AI: [Effect MCP](#claude-code) for docs, [hookify rule](#claude-code) blocking `tsc`

## Quick Start

```sh
gh repo create mylib --template jasonkuhrt/template-typescript-lib --clone --public && \
cd mylib && \
bun install && \
bun run bootstrap
```

Then [setup a repo secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) called `NPM_TOKEN` for CI publishing.

## Effect

This template uses [Effect](https://effect.website) as a peer dependency. Consumers of your library must install Effect themselves.

> **Building an app instead of a library?** Move `effect` from `peerDependencies` to `dependencies` in `package.json`.

The project includes an `.mcp.json` configuring the [Effect MCP server](https://www.npmjs.com/package/effect-mcp) by tim-smart for Claude Code, giving AI agents access to Effect documentation.

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

Run both with `bun run check`.

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
- [Claude Code](#claude-code)
- [Zed Settings](#zed-settings)

<!-- tocstop -->

### TypeScript

- Strict settings via [`@tsconfig/strictest`](https://github.com/tsconfig/bases)
- Node 24 target via [`@tsconfig/node24`](https://github.com/tsconfig/bases)
- Build cache in `node_modules/.cache`
- Output includes `declaration`, `declarationMap`, `sourceMap` for optimal consumer DX
- Source published for go-to-definition support
- `.ts` import specifiers with `rewriteRelativeImportExtensions` at build time
- [Subpath imports](https://nodejs.org/api/packages.html#subpath-imports) (`#lib/*`) for clean internal paths

### Linting

- [oxlint](https://oxc.rs/docs/guide/usage/linter): Rust-based, type-aware with `--deny-warnings`
- [oxlint-tsgolint](https://github.com/nicolo-ribaudo/oxlint-tsgolint): Enables type-aware rules via tsgo
- [actionlint](https://github.com/rhysd/actionlint): GitHub Actions workflow validation
- `--fix-dangerously` enabled for auto-fix (safe with strict types + high coverage)

### Testing

[bun test](https://bun.sh/docs/cli/test) with coverage gating at 90% lines / 90% functions.

### Formatting

[oxfmt](https://oxc.rs/docs/guide/usage/formatter) - Rust-based formatter from the oxc project.

### npm Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `check`         | Run all checks sequentially              |
| `check:format`  | Verify formatting                        |
| `check:lint`    | Run oxlint (type-aware)                  |
| `check:types`   | Type check with tsgo                     |
| `check:cov`     | Run tests + enforce coverage thresholds  |
| `check:package` | Validate package with publint            |
| `check:exports` | Validate exports with attw               |
| `check:ci`      | Lint GitHub Actions workflows            |
| `fix`           | Auto-fix format + lint                   |
| `fix:format`    | Fix formatting                           |
| `fix:lint`      | Auto-fix lint issues (--fix-dangerously) |
| `build`         | Build with tsgo                          |
| `test`          | Run tests                                |

### CI

**PR workflow:**

- actionlint, format, lint, types, publint, exports checks
- Tests on ubuntu/macos/windows
- Coverage gating

**Trunk workflow:**

- Automated canary release via [Dripip](https://github.com/prisma-labs/dripip)

### Claude Code

This template includes AI tooling for [Claude Code](https://docs.anthropic.com/en/docs/claude-code):

- **Effect MCP** (`.mcp.json`): Provides Effect documentation access to Claude Code agents
- **Hookify rule** (`.claude/hookify.use-tsgo.md`): Blocks `tsc` usage, directs agents to use `tsgo` instead

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
