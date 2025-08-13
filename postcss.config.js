// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // <— neu (statt 'tailwindcss')
    autoprefixer: {},
  },
};
