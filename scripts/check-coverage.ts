#!/usr/bin/env bun

import { FileSystem } from '@effect/platform'
import { NodeContext } from '@effect/platform-node'
import { Effect } from 'effect'

type MetricName = 'lines' | 'functions' | 'branches'

type CoverageTotals = Record<MetricName, { found: number; hit: number }>

const [lcovPath, minCoverageInput = '95'] = process.argv.slice(2)

if (!lcovPath) {
  console.error('Usage: bun scripts/check-coverage.ts <lcov-path> [min-coverage]')
  process.exit(1)
}

const minCoverage = Number(minCoverageInput)

if (!Number.isFinite(minCoverage)) {
  console.error('Coverage threshold must be numeric.')
  process.exit(1)
}

const text = await Effect.runPromise(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFileString(lcovPath)
  }).pipe(Effect.provide(NodeContext.layer)),
)

const totals: CoverageTotals = {
  lines: { found: 0, hit: 0 },
  functions: { found: 0, hit: 0 },
  branches: { found: 0, hit: 0 },
}

let sawRecord = false

for (const line of text.split('\n')) {
  if (line.startsWith('LF:')) totals.lines.found += Number(line.slice(3))
  else if (line.startsWith('LH:')) totals.lines.hit += Number(line.slice(3))
  else if (line.startsWith('FNF:')) totals.functions.found += Number(line.slice(4))
  else if (line.startsWith('FNH:')) totals.functions.hit += Number(line.slice(4))
  else if (line.startsWith('BRF:')) totals.branches.found += Number(line.slice(4))
  else if (line.startsWith('BRH:')) totals.branches.hit += Number(line.slice(4))
  else if (line === 'end_of_record') sawRecord = true
}

if (!sawRecord) {
  console.error(`No coverage records found in ${lcovPath}.`)
  process.exit(1)
}

const percent = (hit: number, found: number): number => (found === 0 ? 100 : (hit / found) * 100)

const metricNames = ['lines', 'functions', 'branches'] as const satisfies ReadonlyArray<MetricName>

const trackedMetrics = metricNames
  .map((name) => [name, totals[name]] as const)
  .filter(([, total]) => total.found > 0)

if (trackedMetrics.length === 0) {
  console.error(`No measurable coverage metrics found in ${lcovPath}.`)
  process.exit(1)
}

const summary = trackedMetrics.map(([name, total]) => {
  const coverage = percent(total.hit, total.found)
  return {
    name,
    coverage,
    found: total.found,
    hit: total.hit,
  }
})

console.log(
  `Coverage summary: ${summary
    .map(
      (metric) => `${metric.name} ${metric.coverage.toFixed(2)}% (${metric.hit}/${metric.found})`,
    )
    .join(', ')}`,
)

const failedMetrics = summary.filter((metric) => metric.coverage < minCoverage)

if (failedMetrics.length > 0) {
  console.error(
    `Coverage threshold failed. Required >= ${minCoverage.toFixed(
      2,
    )}% for: ${failedMetrics.map((metric) => metric.name).join(', ')}.`,
  )
  process.exit(1)
}
