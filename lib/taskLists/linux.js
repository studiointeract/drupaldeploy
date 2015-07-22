var nodemiral = require('nodemiral');
var fs = require('fs');
var path = require('path');
var util = require('util');

var SCRIPT_DIR = path.resolve(__dirname, '../../scripts/linux');

exports.setup = function(config) {
  var taskList = nodemiral.taskList('Setup (linux)');

  taskList.executeScript('Setting up Environment', {
    script: path.resolve(SCRIPT_DIR, 'setup-env.sh'),
    vars: {
      repository: config.repository,
      branch: config.branch,
      web: config.web.replace(/(^\/|\/$)/g, ''),
      documentRoot: config.documentRoot,
      installLocation: config.installLocation
    }
  });

  taskList.copy('Copying settings.php', {
    src: config.settings,
    dest: config.installLocation + '/default/settings.php'
  });

  return taskList;
};

exports.deploy = function(config) {
  var taskList = nodemiral.taskList('Deploy (linux)');

  taskList.executeScript('Pulling latest from ' + config.branch, {
    script: path.resolve(SCRIPT_DIR, 'deploy.sh'),
    vars: {
      repository: config.repository,
      branch: config.branch,
      web: config.web.replace(/(^\/|\/$)/g, ''),
      installLocation: config.installLocation,
      group: config.group
    }
  });

  return taskList;
};
