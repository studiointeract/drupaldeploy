var nodemiral = require('nodemiral');
var fs = require('fs');
var path = require('path');
var util = require('util');

var SCRIPT_DIR = path.resolve(__dirname, '../../scripts/linux');
// var TEMPLATES_DIR = path.resolve(__dirname, '../../templates/linux');

exports.setup = function(config) {
  var taskList = nodemiral.taskList('Setup (linux)');

  taskList.executeScript('Setting up Environment', {
    script: path.resolve(SCRIPT_DIR, 'setup-env.sh'),
    vars: {
      repository: config.repository,
      web: config.repository
    }
  });

  return taskList;
};
