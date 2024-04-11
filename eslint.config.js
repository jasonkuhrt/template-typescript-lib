import configPrisma from 'eslint-config-prisma'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(...configPrisma, {
  ignores: [`build`, 'eslint.config.js'],
})
