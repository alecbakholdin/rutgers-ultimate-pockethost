const daisyui = require('daisyui')
const typography = require('@tailwindcss/typography')
const forms = require('@tailwindcss/forms')

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
  },

  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: 'FF004E',
          'primary-content': '#FFFFFF',
        },
      },
    ],
  },

  plugins: [forms, typography, daisyui],
}

module.exports = config
