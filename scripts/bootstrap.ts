import { execa, execaCommand, execaCommandSync } from 'execa'
import { log } from 'floggy'
import Fs from 'fs-jetpack'
import type { QuestionCollection } from 'inquirer'
import I from 'inquirer'

const replaceInFile = (filePath: string, pattern: RegExp, replaceWith: string): void => {
  const file = Fs.read(filePath)
  if (!file) {
    throw new Error(`Could not find file: ${filePath}`)
  }
  const fileUpdated = file.replace(pattern, replaceWith)
  Fs.write(filePath, fileUpdated)
}

interface Answers {
  packageName: string
  developerName: string
  repositoryName?: string
  repositoryOwnerName?: string
  createGithubRepo?: boolean
}

const getGitInfo = () => {
  const hasGitSetup = Fs.exists(`.git`)
  if (!hasGitSetup) return null
  const result = execaCommandSync(`git config --get remote.origin.url`).stdout.match(
    /git@github.com:([^/]+)\/([^/]+).git/,
  )
  if (!result) throw new Error(`Could not get GitHub repository info from git config`)
  const userName = execaCommandSync(`git config --get user.name`).stdout
  return {
    userName,
    repositoryOwnerName: result[1],
    repositoryName: result[2],
  }
}

const gitInfo = getGitInfo()
const prompts: QuestionCollection<any>[] = []
prompts.push(
  {
    type: `input`,
    name: `packageName`,
    message: `What is the name of your package?`,
    default: gitInfo?.repositoryName,
    validate: (input: string) => {
      const pattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
      return pattern.test(input) ? true : `Package name must conform to this pattern: ${String(pattern)}`
    },
  },
  {
    type: `input`,
    name: `developerName`,
    default: gitInfo?.userName,
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
      message:
        `Should the GitHub repository be created now? (Note for this to work there must be an environment variable called 'GITHUB_TOKEN' set with sufficient permissions.)`,
      type: `confirm`,
      name: `createGithubRepo`,
      default: true,
    },
  )
}

const answers = (await I.prompt(prompts)) as Answers

const orgAndRepo = `${answers.repositoryOwnerName ?? gitInfo?.repositoryOwnerName ?? ``}/${
  answers.repositoryName ?? gitInfo?.repositoryName ?? ``
}`

console.log()
log.info(`Now running the bootstraper based on the answers you gave...`)
console.log()

log.info(`Replacing file fields with new values`)

replaceInFile(`README.md`, /jasonkuhrt\/template-typescript-lib/g, orgAndRepo)
replaceInFile(`.github/ISSUE_TEMPLATE/config.yaml`, /jasonkuhrt\/template-typescript-lib/g, orgAndRepo)
// Do this after the above, as package name is subset of repo name
replaceInFile(`package.json`, /jasonkuhrt\/template-typescript-lib/g, orgAndRepo)
replaceInFile(`package.json`, /template-typescript-lib/g, answers.packageName)
replaceInFile(`README.md`, /template-typescript-lib/g, answers.packageName)
replaceInFile(`LICENSE`, /<YOUR NAME>/, answers.developerName)

log.info(`Uninstalling bootstrap deps`)
await execaCommand(`pnpm remove floggy inquirer`)

log.info(`Removing bootstrap command`)
replaceInFile(`package.json`, /\s+"bootstrap":.+\n/g, ``)

log.info(`Removing bootstrap script`)
Fs.remove(`scripts/bootstrap.ts`)

log.info(`Running formatter`)
await execaCommand(`pnpm format`)

if (!gitInfo) {
  log.info(`Creating a new git project`)
  Fs.remove(`.git`)
  await execaCommand(`git init`)
}

log.info(`Creating initial commit`)
await execa(`git`, [`add`, `--all`])
await execa(`git`, [`commit`, `--message="chore: bootstrap"`])

if (answers.createGithubRepo) {
  log.info(`Creating repo on GitHub (you will need the gh CLI setup for this to work)`, {
    url: `https://github.com/${orgAndRepo}`,
  })
  await execa(`gh`, [`repo`, `create`, `--confirm`, `--enable-wiki=false`, `--public`, orgAndRepo])

  log.info(`Pushing main branch and commit to GitHub`)
  await execa(`git`, [`remote`, `add`, `origin`, `git@github.com:${orgAndRepo}.git`])
  await execa(`git`, [`branch`, `-M`, `main`])
  await execa(`git`, [`push`, `-u`, `origin`, `main`])
}

log.info(`deleting self`)
Fs.remove(`scripts`)
replaceInFile(`package.json`, /"bootstrap": "tsx scripts\/bootstrap.ts",/, ``)

log.info(`Now go setup a repository secret called NPM_TOKEN for publishing in CI`, {
  aboutRepoSecerts:
    `https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets`,
  aboutNpmTokens: `https://docs.npmjs.com/creating-and-viewing-authentication-tokens`,
})
