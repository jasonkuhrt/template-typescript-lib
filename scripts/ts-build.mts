import { execaCommandSync } from 'execa'
import Glob from 'fast-glob'
import Fs from 'fs-jetpack'
import * as Path from 'node:path'

// eslint-disable-next-line
const mode = process.argv[2]!.slice(2) as Mode

type Mode = 'cjs' | 'esm'

const oppositeMode = {
  esm: `cjs`,
  cjs: `esm`,
} as const

const extensions = {
  cjs: { node: `cjs`, ts: `cts` },
  esm: { node: `mjs`, ts: `mts` },
} as const

if (mode === `esm`) {
  execaCommandSync(`pnpm tsc --project tsconfig.${mode}.json`, { stdio: `inherit` })
  process.exit(0)
}

const changeImportFilePathMode = (mode: Mode, string: string) => {
  return string.replace(
    new RegExp(`\\.${extensions[oppositeMode[mode]].node}'$`, `gm`),
    `.${extensions[mode].node}'`
  )
}

const changeFilePathMode = (mode: Mode, string: string) => {
  return string.replace(
    new RegExp(`\\.${extensions[oppositeMode[mode]].ts}$`, `g`),
    `.${extensions[mode].ts}`
  )
}

execaCommandSync(`pnpm tsc --project tsconfig.esm.json`, { stdio: `inherit` })

const files = Glob.sync(`src/**/*.${extensions[oppositeMode[mode]].ts}`)

if (files.length === 0) {
  console.log(`No files found.`)
  process.exit(1)
}

files.forEach((oldFilePath) => {
  const newFilePath = changeFilePathMode(mode, oldFilePath)
  Fs.rename(oldFilePath, Path.basename(newFilePath))
  // filePath comes from glob so we know it exists
  // eslint-disable-next-line
  const oldFileContents = Fs.read(newFilePath)!
  const newFileContents = changeImportFilePathMode(mode, oldFileContents)
  Fs.write(newFilePath, newFileContents)
})

execaCommandSync(`pnpm tsc --project tsconfig.${mode}.json`, { stdio: `inherit` })

files.forEach((oldFilePath) => {
  const newFilePath = changeFilePathMode(mode, oldFilePath)
  Fs.rename(newFilePath, Path.basename(oldFilePath))
  // filePath comes from glob so we know it exists
  // eslint-disable-next-line
  const newFileContents = Fs.read(oldFilePath)!
  const oldFileContents = changeImportFilePathMode(oppositeMode[mode], newFileContents)
  Fs.write(oldFilePath, oldFileContents)
})
