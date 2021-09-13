import * as arg from 'arg'
import * as Execa from 'execa'
import { log } from 'floggy'
import * as Fs from 'fs-jetpack'

main()

function main() {
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
  // https://regex101.com/r/qHIbHt/1
  replaceInFile(`.github/workflows/trunk.yml`, /# |^\s*#$|^\s*# todo uncomment me$/gm, '')
  replaceInFile(`LICENSE`, /<YOUR NAME>/, args['--developerName'])

  log.info(`Uninstalling bootstrap deps`)
  Execa.commandSync(`yarn remove execa arg fs-jetpack floggy`)

  log.info(`Removing bootstrap command`)
  replaceInFile('package.json', /\s+"bootstrap":.+\n/g, '')

  log.info(`Removing bootstrap file`)
  Fs.remove('scripts')

  log.info(`Run formatting`)
  Execa.commandSync(`yarn format`)

  log.info(`Creating a new git project`)
  Fs.remove('.git')
  Execa.commandSync(`git init`)

  log.info(`Creating initial commit`)
  Execa.commandSync(`git add -A`)
  Execa.commandSync(`git commit -m 'chore: initial commit'`)

  if (args['--createGithubRepo']) {
    log.info('Creating repo on GitHub (you will need the gh CLI setup for this to work)')
    Execa.commandSync(`gh repo create --confirm --enable-wiki=false --public ${args['--repoOrg']}`)

    log.info('Pushing main branch and commit to GitHub')
    Execa.commandSync(`git remote add origin https://github.com/${args['--repoOrg']}.git && git branch -M main
  && git push -u origin main`)
  }
}

function replaceInFile(filePath: string, pattern: RegExp, replaceWith: string): void {
  const file = Fs.read(filePath)
  if (!file) {
    throw new Error(`Could not find file: ${filePath}`)
  }
  const fileUpdated = file.replace(pattern, replaceWith)
  Fs.write(filePath, fileUpdated)
}
