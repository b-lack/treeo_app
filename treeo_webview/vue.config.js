'use strict'

const path = require('path')

module.exports = {
  publicPath: '',
  outputDir: path.resolve(__dirname, '../treeo_cordova/www'),
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  }
}
