import { generateTSESLintConfigurations } from '@kynsonszetau/lint';

/** @type { import('eslint').Linter.Config } */
export default [...generateTSESLintConfigurations(['src/**/*.ts'])];
