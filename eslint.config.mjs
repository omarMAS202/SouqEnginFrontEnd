import js from '@eslint/js'
import nextVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

const config = [
  {
    ignores: ['.next/**', 'coverage/**', 'playwright-report/**'],
  },
  js.configs.recommended,
  ...nextVitals,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'import/no-anonymous-default-export': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
  prettier,
]

export default config
