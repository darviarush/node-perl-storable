module.exports = {
    'root': true,
    'env': {
        'es6': true,
        'node': true,
        'jest': true,
    },
    'extends': [
        'eslint:recommended',
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly',
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module',
        'parser': 'babel-eslint',
    },
    'rules': {
        'brace-style': [
            'error',
            '1tbs',
        ],
        'comma-dangle': ['error', {
            'arrays': 'always-multiline',
            'objects': 'always-multiline',
            'imports': 'never',
            'exports': 'never',
            'functions': 'always-multiline',
        }],
        'eol-last': ['error', 'always'],
        'indent': ['error', 4],
        'key-spacing': ['error', { 'afterColon': true, 'mode': 'strict' }],
        'max-depth': ['error', 4],
        'max-nested-callbacks': ['error', 3],
        'max-statements': ['error', 15, { 'ignoreTopLevelFunctions': true }],
        'no-console': 'off',
        'no-inner-declarations': 'error',
        'no-global-assign': 'error',
        'no-lonely-if': 'error',
        'no-prototype-builtins': 'error',
        'no-redeclare': 'error',
        'no-useless-escape': 'error',
        'no-undef': 'error',
        'no-unneeded-ternary': 'error',
        'no-unsafe-negation': 'error',
        'no-unused-vars': 'error',
        'object-curly-spacing': ['error', 'always'],
        'operator-linebreak': ['error', 'none'],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: 'function', next: 'function' },
            { blankLine: 'always', prev: 'block', next: 'block' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: 'var', next: 'if' },
        ],
        'semi': ['error', 'always'],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', 'always'],
        'quotes': ['error', 'single'],
    },
    overrides: [
        {
            files: [
                '**/*.test.js',
            ],
            env: {
                jest: true, // now **/*.test.js files" env has both es6 *and* jest
            },
            // Can"t extend in overrides: https://github.com/eslint/eslint/issues/8813
            // "extends": ["plugin:jest/recommended"]
            plugins: ['jest'],
            rules: {
                'jest/no-disabled-tests': 'warn',
                'jest/no-focused-tests': 'error',
                'jest/no-identical-title': 'error',
                'jest/prefer-to-have-length': 'warn',
                'jest/valid-expect': 'error',
            },
        },
    ],
};
