import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    ignores: ['dist', 'node_modules'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
    },
  }
]


// # 基础 ESLint
// npm install --save-dev eslint

// # TypeScript 支持（如果用 TS）
// npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

// # 如果使用 Prettier（可选）
// npm install --save-dev prettier eslint-config-prettier

// "lint": "eslint . --fix",
// "lint:check": "eslint ."