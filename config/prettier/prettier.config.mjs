/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  trailingComma: 'es5',
  tailwindFunctions: ['clsx', 'tw', 'cn'],
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/tailwind.css',
  overrides: [
    {
      files: ['src/components/ui/kibo-ui/**/*.tsx'],
      options: {
        printWidth: 100,
        semi: true,
      },
    },
  ],
}

export default config
