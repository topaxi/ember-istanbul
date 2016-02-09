var path             = require('path')
var Funnel           = require('broccoli-funnel')
var createMiddleware = require('./lib/middleware')
var Instrumenter     = require('./lib/instrumenter')

module.exports = {
  name: 'ember-istanbul',

  shouldInstrument() {
    return this.app.env !== 'production'
  },

  middleware(app, options) {
    options.istanbul = require('istanbul')
    app.post('/coverage-report',
      require('body-parser').json({ limit: '1gb' }),
      createMiddleware(options)
    )
  },

  testemMiddleware(app) {
    if (!this.shouldInstrument()) return

    this.middleware(app, {})
  },

  serverMiddleware(options) {
    if (!this.shouldInstrument()) return

    var app = options.app
    this.app = app
    this.middleware(app, {})
  },

  setupPreprocessorRegistry(type, registry) {
    registry.add('js', new Instrumenter({
      appName:  this.parent.pkg.name,
      istanbul: require('istanbul')
    }))
  },

  treeForPublic() {
    var testemPath = path.join(require.resolve('testem'), '../..', 'public/testem')
    return new Funnel(testemPath, {
      files: [
        'testem_client.js',
        'mocha_adapter.js',
        'qunit_adapter.js'
      ],
      destDir: 'assets'
    })
  },

  contentFor(type) {
    if (type === 'test-body-footer') {
      return `
        <script src="assets/qunit_adapter.js"></script>
        <script src="assets/mocha_adapter.js"></script>
        <script>
          Testem.on('all-test-results', function(results) {
            jQuery.ajax('/coverage-report', {
              type:        'post',
              dataType:    'json',
              contentType: 'application/json',
              data:        JSON.stringify(window.__coverage__)
            })
          })
        </script>
      `
    }
  }
}
