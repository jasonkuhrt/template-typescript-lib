import { execaCommandSync } from 'execa'
import * as Fs from 'node:fs'
import { EOL } from 'node:os'

const packageJson = JSON.parse(Fs.readFileSync(`package.json`, `utf8`)) as { type?: 'module' | 'commonjs' }
Fs.writeFileSync(`package.json`, JSON.stringify({ ...packageJson, type: `module` }, null, 2))

execaCommandSync(`pnpm tsc --project tsconfig.esm.json`, { stdio: `inherit` })

Fs.writeFileSync(`package.json`, JSON.stringify(packageJson, null, 2) + EOL)
