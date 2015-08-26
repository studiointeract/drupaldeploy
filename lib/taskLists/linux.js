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

  if (config.rsyncFilesPath && config.rsyncFilesPath.length > 0) {
    var rsyncPath = config.rsyncFilesPath.replace(/\/+$/, '') + '/';
    taskList.executeScript('Rsync files from ' + config.rsyncFilesPath, {
      script: path.resolve(SCRIPT_DIR, 'rsync.sh'),
      vars: {
        installLocation: config.installLocation,
        rsyncFilesPath: rsyncPath
      }
    });
  }

  var settingsPath = path.resolve(config.settings);

  console.log(config.installLocation + '/default/settings.php');

  if(fs.existsSync(settingsPath)) {
    taskList.copy('Copying settings.php', {
      src: settingsPath,
      dest: config.installLocation + '/default/settings.php'
    });
  }

  return taskList;
};

exports.deploy = function(config) {
  var taskList = nodemiral.taskList('Deploy (linux)');

  taskList.executeScript('Pulling latest from ' + config.branch + ' on ' + config.repository, {
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

exports.rsync = function(config) {
  var taskList = nodemiral.taskList('Rsync (linux)');

  if (config.rsyncFilesPath && config.rsyncFilesPath.length > 0) {
    var rsyncPath = config.rsyncFilesPath.replace(/\/+$/, '') + '/';
    taskList.executeScript('Rsync files from ' + config.rsyncFilesPath, {
      script: path.resolve(SCRIPT_DIR, 'rsync.sh'),
      vars: {
        installLocation: config.installLocation,
        rsyncFilesPath: rsyncPath
      }
    });
  }

  return taskList;
};

exports['sql-sync'] = function(config) {
  var taskList = nodemiral.taskList('SQL-sync (linux)');

  if (config.sqlSync && typeof config.sqlSync == 'object') {
    var remote = config.sqlSync.host + '@' +  config.sqlSync.user;
    taskList.executeScript('SQL-sync ' + config.sqlSync.database.database + ' from ' + remote, {
      script: path.resolve(SCRIPT_DIR, 'sql-sync.sh'),
      vars: {
        dbUsername: config.database.username,
        dbPassword: config.database.password,
        dbDatabase: config.database.database,
        remoteUser: config.sqlSync.remote.user,
        remoteHost: config.sqlSync.remote.host,
        remoteDBUsername: config.sqlSync.database.username,
        remoteDBPassword: config.sqlSync.database.password,
        remoteDBdatabase: config.sqlSync.database.database
      }
    });
  }

  return taskList;
};
