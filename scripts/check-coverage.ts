#!/usr/bin/env tsx

const [lcovPath, minLinesInput = '85', minFunctionsInput = '55'] = process.argv.slice(2)

if (!lcovPath) {
  console.error('Usage: tsx scripts/check-coverage.ts <lcov-path> [min-lines] [min-functions]')
  process.exit(1)
}

const minLines = Number(minLinesInput)
const minFunctions = Number(minFunctionsInput)

if (!Number.isFinite(minLines) || !Number.isFinite(minFunctions)) {
  console.error('Coverage thresholds must be numeric.')
  process.exit(1)
}

type CoverageRecord = {
  linesFound: number
  linesHit: number
  functionsFound: number
  functionsHit: number
}

import { readFileSync } from 'node:fs'

const text = readFileSync(lcovPath, 'utf-8')
const records: CoverageRecord[] = []
let current: CoverageRecord = { linesFound: 0, linesHit: 0, functionsFound: 0, functionsHit: 0 }

for (const line of text.split('\n')) {
  if (line.startsWith('LF:')) current.linesFound = Number(line.slice(3))
  else if (line.startsWith('LH:')) current.linesHit = Number(line.slice(3))
  else if (line.startsWith('FNF:')) current.functionsFound = Number(line.slice(4))
  else if (line.startsWith('FNH:')) current.functionsHit = Number(line.slice(4))
  else if (line === 'end_of_record') {
    records.push(current)
    current = { linesFound: 0, linesHit: 0, functionsFound: 0, functionsHit: 0 }
  }
}

if (records.length === 0) {
  console.error(`No coverage records found in ${lcovPath}.`)
  process.exit(1)
}

const percent = (hit: number, found: number): number => (found === 0 ? 100 : (hit / found) * 100)
const average = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length

const linesPct = average(records.map((record) => percent(record.linesHit, record.linesFound)))
const functionsPct = average(
  records.map((record) => percent(record.functionsHit, record.functionsFound)),
)

console.log(
  `Coverage summary: ${linesPct.toFixed(2)}% lines, ${functionsPct.toFixed(2)}% functions across ${records.length} files`,
)

if (linesPct < minLines || functionsPct < minFunctions) {
  console.error(
    `Coverage threshold failed. Required >= ${minLines}% lines and >= ${minFunctions}% functions.`,
  )
  process.exit(1)
}
