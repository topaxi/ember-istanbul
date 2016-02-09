var fs   = require('fs')
var stew = require('broccoli-stew')

function Instrumenter(options) {
  this.name     = 'ember-babel-istanbul'
  this.ext      = 'js'
  this.appName  = options.appName
  this.istanbul = options.istanbul
}

module.exports = Instrumenter

Instrumenter.prototype.toTree = function toTree(tree, inputPath, outputPath) {
  var appName      = this.appName
  var instrumenter = new this.istanbul.Instrumenter()

  return stew.map(tree, '**/*.js', function mapTree(data, filePath) {
    var path
    path = filePath.replace(new RegExp('^modules/' + appName), 'addon')
    path = filePath.replace(new RegExp('^' + appName), 'app')

    if (!fs.existsSync(path)) {
      return data
    }

    return instrumenter.instrumentSync(data, path)
  })
}
