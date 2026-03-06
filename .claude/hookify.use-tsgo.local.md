---
name: block-tsc-use-tsgo
enabled: true
event: bash
action: block
pattern: (?:^|&&|\|\||;)\s*(?:npx\s+)?tsc\s
---

**BLOCKED: Do not invoke `tsc` directly.**

This codebase uses `tsgo` (the Go-based TypeScript compiler). The standard `tsc` is extremely slow.

**Use the npm scripts instead:**

- `bun run check:types` -- type check
- `bun run build` -- build (uses tsgo --build)
