module.exports = {
  browser: {
    firefox: {
      manifest: './manifest.firefox.json',
      manifestVersion: 2
    }
  },
  polyfill: true,
  runner: {
    typescript: true
  }
}