module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "extends": [
        "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
        "plugin:@typescript-eslint/recommended" // Uses the recommended rules from @typescript-eslint/eslint-plugin
    ],
    "parserOptions": {
        "project": "tsconfig.eslint.json",
        "sourceType": "module",
        "parserOptions": {
            "ecmaFeatures": {
                jsx: true,
                tsx: true
            }
        },
    },
    "plugins": [
        "@typescript-eslint", "eslint-plugin-react"
    ],
    "rules": {
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "none",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            "never"
        ],
        "@typescript-eslint/explicit-function-return-type": "off"
    },
    "overrides": [
        {
            "files": ["**/*.spec.*"],
            "rules": {
              "@typescript-eslint/no-explicit-any": "off"
            }
        }
    ]
}