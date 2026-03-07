import * as Command from '@effect/platform/Command'
import { FileSystem } from '@effect/platform'
import { NodeContext } from '@effect/platform-node'
import * as Chunk from 'effect/Chunk'
import { Effect, Stream } from 'effect'
import { log } from 'floggy'
import type * as Inquirer from 'inquirer'
import inquirer from 'inquirer'

interface Answers {
  packageName: string
  developerName: string
  repositoryName?: string
  repositoryOwnerName?: string
  createGithubRepo?: boolean
}

const decodeUtf8 = (chunks: ReadonlyArray<Uint8Array>): string => {
  const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0)
  const output = new Uint8Array(size)
  let offset = 0

  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new TextDecoder().decode(output)
}

const collectOutput = (stream: Stream.Stream<Uint8Array, unknown>) =>
  Stream.runCollect(stream).pipe(Effect.map((chunks) => decodeUtf8(Chunk.toReadonlyArray(chunks))))

const runCommand = (command: string, args: ReadonlyArray<string>): Promise<string> =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const process = yield* Command.start(Command.make(command, ...args))
        const [stdout, stderr, exitCode] = yield* Effect.all(
          [collectOutput(process.stdout), collectOutput(process.stderr), process.exitCode],
          { concurrency: `unbounded` },
        )

        if (Number(exitCode) !== 0) {
          return yield* Effect.fail(new Error(stderr.trim() || stdout.trim() || `Command failed`))
        }

        return stdout.trim()
      }).pipe(Effect.provide(NodeContext.layer)),
    ),
  )

const pathExists = (path: string): Promise<boolean> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      return yield* fs.exists(path)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

const readText = (path: string): Promise<string> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      return yield* fs.readFileString(path)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

const writeText = (path: string, content: string): Promise<void> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      yield* fs.writeFileString(path, content)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

const removePath = (
  path: string,
  options?: {
    recursive?: boolean
    force?: boolean
  },
): Promise<void> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      yield* fs.remove(path, options)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

const replaceInFile = async (
  filePath: string,
  pattern: RegExp,
  replaceWith: string,
): Promise<void> => {
  const file = await readText(filePath).catch(() => null)
  if (file === null) {
    throw new Error(`Could not find file: ${filePath}`)
  }
  await writeText(filePath, file.replace(pattern, replaceWith))
}

const getGitInfo = async (): Promise<{
  userName: string
  repositoryOwnerName: string
  repositoryName: string
} | null> => {
  const hasGitSetup = await pathExists(`.git`)
  if (!hasGitSetup) return null

  const originUrl = await runCommand(`git`, [`config`, `--get`, `remote.origin.url`])
  const result = /git@github.com:([^/]+)\/([^/]+).git/.exec(originUrl)
  if (!result) throw new Error(`Could not get GitHub repository info from git config`)
  const repositoryOwnerName = result[1]
  const repositoryName = result[2]
  if (repositoryOwnerName === undefined || repositoryName === undefined) {
    throw new Error(`Could not get GitHub repository info from git config`)
  }

  const userName = await runCommand(`git`, [`config`, `--get`, `user.name`])

  return {
    userName,
    repositoryOwnerName,
    repositoryName,
  }
}

const gitInfo = await getGitInfo()
const prompts: Inquirer.DistinctQuestion[] = []
prompts.push(
  {
    type: `input`,
    name: `packageName`,
    message: `What is the name of your package?`,
    validate: (input: string) => {
      const pattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
      return pattern.test(input)
        ? true
        : `Package name must conform to this pattern: ${String(pattern)}`
    },
    ...(gitInfo?.repositoryName ? { default: gitInfo.repositoryName } : {}),
  },
  {
    type: `input`,
    name: `developerName`,
    ...(gitInfo?.userName ? { default: gitInfo.userName } : {}),
    message: `What is your name? This will be used in places needing a package author name.`,
  },
)

if (!gitInfo) {
  prompts.push(
    {
      type: `input`,
      name: `repositoryName`,
      message: `What is the name of your GitHub repository?`,
      validate: (input: string) => {
        const pattern = /[A-Za-z0-9_.-]{1,100}/
        return pattern.test(input)
          ? true
          : `GitHub repository name must conform to this pattern: ${String(pattern)}`
      },
    },
    {
      type: `input`,
      name: `repositoryOwnerName`,
      message: `Who is the repository owner of your GitHub repository?`,
      validate: (input: string) => {
        const pattern = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
        return pattern.test(input)
          ? true
          : `GitHub repository owner must conform to this pattern: ${String(pattern)}`
      },
    },
    {
      message: `Should the GitHub repository be created now? (Note for this to work there must be an environment variable called 'GITHUB_TOKEN' set with sufficient permissions.)`,
      type: `confirm`,
      name: `createGithubRepo`,
      default: true,
    },
  )
}

// oxlint-disable-next-line no-unsafe-type-assertion -- inquirer.prompt doesn't support narrowing to custom interfaces
const answers = (await inquirer.prompt(prompts)) as Answers

const orgAndRepo = `${answers.repositoryOwnerName ?? gitInfo?.repositoryOwnerName ?? ``}/${
  answers.repositoryName ?? gitInfo?.repositoryName ?? ``
}`

console.log()
log.info(`Now running the bootstraper based on the answers you gave...`)
console.log()

log.info(`Replacing file fields with new values`)

await replaceInFile(`README.md`, /jasonkuhrt\/template-typescript-lib/g, orgAndRepo)
await replaceInFile(
  `.github/ISSUE_TEMPLATE/config.yaml`,
  /jasonkuhrt\/template-typescript-lib/g,
  orgAndRepo,
)
await replaceInFile(`package.json`, /jasonkuhrt\/template-typescript-lib/g, orgAndRepo)
await replaceInFile(`package.json`, /template-typescript-lib/g, answers.packageName)
await replaceInFile(`README.md`, /template-typescript-lib/g, answers.packageName)
await replaceInFile(`LICENSE`, /<YOUR NAME>/, answers.developerName)

log.info(`Uninstalling bootstrap deps`)
await runCommand(`pnpm`, [`remove`, `floggy`, `inquirer`])

log.info(`Removing bootstrap command`)
await replaceInFile(`package.json`, /\s+"bootstrap":.+\n/g, ``)

log.info(`Removing bootstrap script`)
await removePath(`scripts/bootstrap.ts`, { force: true })

log.info(`Running formatter`)
await runCommand(`pnpm`, [`run`, `fix`])

if (!gitInfo) {
  log.info(`Creating a new git project`)
  await removePath(`.git`, { recursive: true, force: true })
  await runCommand(`git`, [`init`])
}

log.info(`Creating initial commit`)
await runCommand(`git`, [`add`, `--all`])
await runCommand(`git`, [`commit`, `--message`, `chore: bootstrap`])

if (answers.createGithubRepo) {
  log.info(`Creating repo on GitHub (you will need the gh CLI setup for this to work)`, {
    url: `https://github.com/${orgAndRepo}`,
  })
  await runCommand(`gh`, [
    `repo`,
    `create`,
    `--confirm`,
    `--enable-wiki=false`,
    `--public`,
    orgAndRepo,
  ])

  log.info(`Pushing main branch and commit to GitHub`)
  await runCommand(`git`, [`remote`, `add`, `origin`, `git@github.com:${orgAndRepo}.git`])
  await runCommand(`git`, [`branch`, `-M`, `main`])
  await runCommand(`git`, [`push`, `-u`, `origin`, `main`])
}

log.info(`Now go setup a repository secret called NPM_TOKEN for publishing in CI`, {
  aboutRepoSecerts: `https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets`,
  aboutNpmTokens: `https://docs.npmjs.com/creating-and-viewing-authentication-tokens`,
})
