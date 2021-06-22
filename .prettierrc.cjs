/**
 * @see https://prettier.io/docs/en/configuration.html
 */
module.exports = {
  ...require('@prisma-labs/prettier-config'),
  // Until https://github.com/daidodo/format-imports/issues/7 is resolved
  trailingComma: 'none'
}
