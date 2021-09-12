import * as arg from 'arg'
import * as Execa from 'execa'
import * as Fs from 'fs-jetpack'

main()

function main() {
  const args = arg({
    '--repoOrg': String,
    '--developerName': String,
    '--packageName': String,
  })

  if (!args['--repoOrg'] || !args['--developerName'] || !args['--packageName']) {
    throw new Error(`Missing required flag.`)
  }

  console.log(`Replacing file fields with new values`)

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

  console.log(`Uninstalling bootstrap deps`)
  Execa.commandSync(`yarn remove execa arg fs-jetpack`)

  console.log(`Removing bootstrap command`)
  replaceInFile('package.json', /\s+"bootstrap":.+\n/g, '')

  console.log(`Removing bootstrap file`)
  Fs.remove('scripts')

  console.log(`Run formatting`)
  Execa.commandSync(`yarn format`)

  console.log(`Creating a new git project`)
  Fs.remove('.git')
  Execa.commandSync(`git init`)

  console.log(`Creating initial commit`)
  Execa.commandSync(`git add -A`)
  Execa.commandSync(`git commit -m 'feat: initial commit'`)
}

function replaceInFile(filePath: string, pattern: RegExp, replaceWith: string): void {
  const file = Fs.read(filePath)
  if (!file) {
    throw new Error(`Could not find file: ${filePath}`)
  }
  const fileUpdated = file.replace(pattern, replaceWith)
  Fs.write(filePath, fileUpdated)
}
