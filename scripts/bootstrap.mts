import * as Execa from 'execa'
import { log } from 'floggy'
import * as Fs from 'fs-jetpack'
import I from 'inquirer'

const main = async () => {
  interface Answers {
    packageName: string
    developerName: string
    repositoryName: string
    repositoryOwnerName: string
    createGithubRepo: boolean
  }
  const answers = (await I.prompt([
    {
      type: `input`,
      name: `packageName`,
      message: `What is the name of your package?`,
      validate: (input: string) => {
        const pattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
        return pattern.test(input) ? true : `Package name must conform to this pattern: ${String(pattern)}`
      },
    },
    {
      type: `input`,
      name: `developerName`,
      message: `What is your name? This will be used in places needing a package author name.`,
    },
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
  ])) as Answers

  const orgAndRepo = `${answers.repositoryOwnerName}/${answers.repositoryName}`

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
  Execa.commandSync(`pnpm remove execa fs-jetpack floggy inquirer`)

  log.info(`Removing bootstrap command`)
  replaceInFile(`package.json`, /\s+"bootstrap":.+\n/g, ``)

  log.info(`Removing bootstrap script`)
  Fs.remove(`scripts`)

  log.info(`Running formatter`)
  Execa.commandSync(`pnpm format`)

  log.info(`Creating a new git project`)
  Fs.remove(`.git`)
  Execa.commandSync(`git init`)

  log.info(`Creating initial commit`)
  Execa.sync(`git`, [`add`, `--all`])
  Execa.sync(`git`, [`commit`, `--message="chore: initial commit"`])

  if (answers.createGithubRepo) {
    log.info(`Creating repo on GitHub (you will need the gh CLI setup for this to work)`, {
      url: `https://github.com/${orgAndRepo}`,
    })
    Execa.sync(`gh`, [`repo`, `create`, `--confirm`, `--enable-wiki=false`, `--public`, `${orgAndRepo}`])

    log.info(`Pushing main branch and commit to GitHub`)
    Execa.sync(`git`, [`remote`, `add`, `origin`, `git@github.com:${orgAndRepo}.git`])
    Execa.sync(`git`, [`branch`, `-M`, `main`])
    Execa.sync(`git`, [`push`, `-u`, `origin`, `main`])
  }

  log.info(`Now go setup a repository secret called NPM_TOKEN for publishing in CI`, {
    aboutRepoSecerts: `https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets`,
    aboutNpmTokens: `https://docs.npmjs.com/creating-and-viewing-authentication-tokens`,
  })
}

const replaceInFile = (filePath: string, pattern: RegExp, replaceWith: string): void => {
  const file = Fs.read(filePath)
  if (!file) {
    throw new Error(`Could not find file: ${filePath}`)
  }
  const fileUpdated = file.replace(pattern, replaceWith)
  Fs.write(filePath, fileUpdated)
}

main().catch(console.error)
