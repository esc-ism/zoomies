import globals from 'globals';

import path from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import emptyIndent from 'eslint-plugin-indent-empty-lines';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended});

export default [
	{files: ['src/**/*.js'], languageOptions: {sourceType: 'module'}},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.greasemonkey,
			},
			parserOptions: {
				sourceType: 'module',
				ecmaFeatures: {globalReturn: true},
				requireConfigFile: false,
				babelOptions: {
					babelrc: false,
					configFile: false,
				},
			},
		},
	},
	...compat.extends('eslint:recommended'),
	stylistic.configs.customize({
		semi: (true),
		braceStyle: '1tbs',
		indent: 'tab',
	}),
	{
		plugins: {'indent-empty-lines': emptyIndent},
		rules: {
			'require-await': 'error',
			'no-debugger': 'warn',
			'no-console': ['warn', {allow: ['warn', 'error']}],
			'object-shorthand': 'error',
			'jsdoc/require-jsdoc': 'off',
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/no-extra-parens': 'error',
			'@stylistic/quote-props': ['error', 'as-needed'],
			'@stylistic/no-tabs': ['error', {allowIndentationTabs: true}],
			'@stylistic/object-curly-spacing': ['error', 'never'],
			'@stylistic/operator-linebreak': ['error', 'before', {overrides: {'?': 'after', ':': 'after'}}],
			'@stylistic/object-curly-newline': ['error', {consistent: true}],
			'@stylistic/arrow-parens': ['error', 'always'],
			'@stylistic/linebreak-style': ['error', 'unix'],
			'@stylistic/no-trailing-spaces': ['error', {skipBlankLines: true}],
			// '@stylistic/array-bracket-newline': ['error', {multiline: true}],
			'@stylistic/array-element-newline': 'off',
			// the exceptions thing is weird
			'@stylistic/comma-style': ['error', 'last', {exceptions: {CallExpression: false}}],
			'@stylistic/function-paren-newline': ['error', 'multiline'],
			'@stylistic/padding-line-between-statements': [
				'error',
				{blankLine: 'always', prev: 'block-like', next: '*'},
				{blankLine: 'always', prev: '*', next: 'block-like'},
				{blankLine: 'any', prev: 'case', next: 'case'},
			],
			'indent-empty-lines/indent-empty-lines': ['error', 'tab'],
			// 'no-unused-vars': 'off',
			// 'no-undef': 'off',
		},
	},
];
