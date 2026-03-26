/**
 * @type {import("lint-staged").Configuration}
 */
export default {
  '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': [
    'oxfmt --write',
    'oxlint --type-aware --fix-dangerously --deny-warnings --',
    'oxfmt --write',
  ],
  '*.{json,md}': ['oxfmt --write'],
}
