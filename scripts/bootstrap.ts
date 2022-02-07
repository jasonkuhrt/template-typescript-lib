import * as arg from 'arg'
import * as Execa from 'execa'
import { log } from 'floggy'
import * as Fs from 'fs-jetpack'

const main = () => {
  const args = arg({
    '--createGithubRepo': Boolean,
    '--repoOrg': String,
    '--developerName': String,
    '--packageName': String,
  })

  if (!args['--repoOrg'] || !args['--developerName'] || !args['--packageName']) {
    throw new Error(`Missing required flag.`)
  }

  log.info(`Replacing file fields with new values`)

  replaceInFile('README.md', /jasonkuhrt\/template-typescript-lib/g, args['--repoOrg'])
  replaceInFile(
    '.github/ISSUE_TEMPLATE/config.yml',
    /jasonkuhrt\/template-typescript-lib/g,
    args['--repoOrg']
  )
  // Do this after the above, as package name is subset of repo name
  replaceInFile('package.json', /template-typescript-lib/g, args['--packageName'])
  replaceInFile('README.md', /template-typescript-lib/g, args['--packageName'])
  replaceInFile(`LICENSE`, /<YOUR NAME>/, args['--developerName'])

  log.info(`Uninstalling bootstrap deps`)
  Execa.commandSync(`yarn remove execa arg fs-jetpack floggy`)

  log.info(`Removing bootstrap command`)
  replaceInFile('package.json', /\s+"bootstrap":.+\n/g, '')

  log.info(`Removing bootstrap script`)
  Fs.remove('scripts')

  log.info(`Running formatter`)
  Execa.commandSync(`yarn format`)

  log.info(`Creating a new git project`)
  Fs.remove('.git')
  Execa.commandSync(`git init`)

  log.info(`Creating initial commit`)
  Execa.sync(`git`, [`add`, `--all`])
  Execa.sync(`git`, [`commit`, `--message="chore: initial commit"`])

  if (args['--createGithubRepo']) {
    log.info('Creating repo on GitHub (you will need the gh CLI setup for this to work)')
    Execa.sync(`gh`, [
      `repo`,
      `create`,
      `--confirm`,
      `--enable-wiki=false`,
      `--public`,
      `${args['--repoOrg']}`,
    ])

    log.info('Pushing main branch and commit to GitHub')
    Execa.sync(`git`, [
      `remote`,
      `add`,
      `origin`,
      `https://github.com/${args['--repoOrg']}/${args['--packageName']}.git`,
    ])
    Execa.sync(`git`, [`branch`, `-M`, `main`])
    Execa.sync(`git`, [`push`, `-u`, `origin`, `main`])
  }
}

const replaceInFile = (filePath: string, pattern: RegExp, replaceWith: string): void => {
  const file = Fs.read(filePath)
  if (!file) {
    throw new Error(`Could not find file: ${filePath}`)
  }
  const fileUpdated = file.replace(pattern, replaceWith)
  Fs.write(filePath, fileUpdated)
}

main()
