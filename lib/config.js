var cjson = require('cjson');
var path = require('path');
var fs = require('fs');

exports.read = function() {
  var configJsonPath = path.resolve('config.json');
  if (fs.existsSync(configJsonPath)) {
    var configJson = cjson.load(configJsonPath);

    console.log(configJson);
  }
}
