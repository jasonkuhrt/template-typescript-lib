#!/usr/bin/env bun

/**
 * Rewrites package.json `imports` from source paths to build paths for publishing.
 * ./src/*.ts -> ./build/*.js
 *
 * Run with --restore to undo after packing.
 */

import { FileSystem } from '@effect/platform'
import { NodeContext } from '@effect/platform-node'
import { Effect } from 'effect'

const pkgPath = decodeURIComponent(new URL('../package.json', import.meta.url).pathname)

const raw = await Effect.runPromise(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFileString(pkgPath)
  }).pipe(Effect.provide(NodeContext.layer)),
)

// oxlint-disable-next-line no-unsafe-assignment -- JSON.parse returns any; package.json structure is trusted
const pkg: Record<string, unknown> = JSON.parse(raw)
const imports = pkg['imports']

if (!imports || typeof imports !== 'object') {
  console.log('No imports field - nothing to rewrite.')
  process.exit(0)
}

const restore = process.argv.includes('--restore')
const rewritten: Record<string, unknown> = {}

for (const [key, value] of Object.entries(imports)) {
  if (typeof value !== 'string') {
    rewritten[key] = value
    continue
  }
  rewritten[key] = restore
    ? value.replace(/^\.\/build\//, './src/').replace(/\.js$/, '.ts')
    : value.replace(/^\.\/src\//, './build/').replace(/\.ts$/, '.js')
}

pkg['imports'] = rewritten

await Effect.runPromise(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    yield* fs.writeFileString(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }).pipe(Effect.provide(NodeContext.layer)),
)

console.log(restore ? 'Restored imports to source paths.' : 'Rewrote imports to build paths.')
