module.exports = function(options) {
  var reporters = options.reporters || [ 'lcov', 'text' ]
  var collector = new options.istanbul.Collector
  var reporter  = new options.istanbul.Reporter

  reporter.addAll(reporters)

  return (req, res) => {
    collector.add(req.body)
    reporter.write(collector, false)
    res.status(200) //eslint-disable-line no-magic-numbers
    res.send()
  }
}
