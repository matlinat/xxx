// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // <-- nicht 'tailwindcss'
    autoprefixer: {},
  },
};
