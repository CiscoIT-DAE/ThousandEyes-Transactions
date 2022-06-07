module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:wdio/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    'rules': {
        'indent': ['error', 4, {'SwitchCase': 1}],
        'max-len': ['warn', 80],
    },
    'plugins': ['wdio'],
};