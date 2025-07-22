module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(), // <- updated!
    require('autoprefixer')
  ]
}
