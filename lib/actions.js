var nodemiral = require('nodemiral');
var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
require('colors');

module.exports = Actions;

function Actions(config, cwd) {
  this.cwd = cwd;
  this.config = config;
  this.sessionsMap = this._createSessionsMap(config);
}

Actions.prototype._createSessionsMap = function(config) {
  var sessionsMap = {};

  config.servers.forEach(function(server) {
    var host = server.host;
    var auth = {username: server.username};

    if(server.pem) {
      auth.pem = fs.readFileSync(path.resolve(server.pem), 'utf8');
    } else {
      auth.password = server.password;
    }

    var nodemiralOptions = {
      ssh: server.sshOptions,
      keepAlive: true
    };

    if(!sessionsMap[server.os]) {
      sessionsMap[server.os] = {
        sessions: [],
        taskListsBuilder:require('./taskLists')(server.os)
      };
    }

    var session = nodemiral.session(host, auth, nodemiralOptions);
    session._serverConfig = server;
    sessionsMap[server.os].sessions.push(session);
  });

  return sessionsMap;
};

Actions.prototype._executePararell = function(actionName, args) {
  var self = this;
  var sessionInfoList = _.values(self.sessionsMap);
  async.map(
    sessionInfoList,
    function(sessionsInfo, callback) {
      var taskList = sessionsInfo.taskListsBuilder[actionName]
        .apply(sessionsInfo.taskListsBuilder, args);
      taskList.run(sessionsInfo.sessions, function(summaryMap) {
        callback(null, summaryMap);
      });
    },
    whenAfterCompleted
  );
};

Actions.prototype.setup = function() {
  this._executePararell("setup", [this.config]);
};

Actions.prototype.deploy = function() {
  this._executePararell("deploy", [this.config]);
};

Actions.prototype.rsync = function() {
  this._executePararell("rsync", [this.config]);
};

Actions.prototype['sql-sync'] = function() {
  this._executePararell("sql-sync", [this.config]);
};

Actions.prototype.logs = function() {
  var self = this;
  var tailOptions = process.argv.slice(3).join(" ");

  for(var os in self.sessionsMap) {
    var sessionsInfo = self.sessionsMap[os];
    sessionsInfo.sessions.forEach(function(session) {
      var hostPrefix = '[' + session._host + '] ';
      var options = {
        onStdout: function(data) {
          process.stdout.write(hostPrefix + data.toString());
        },
        onStderr: function(data) {
          process.stderr.write(hostPrefix + data.toString());
        }
      };

      if(os == 'linux') {
        var command = 'sudo tail ' + tailOptions + ' /var/log/apache2/error.log';
      }
      // else if(os == 'sunos') {
      //   var command = 'sudo tail ' + tailOptions +
      //     ' /var/svc/log/site-' + self.config.appName + '\\:default.log';
      // }
      session.execute(command, options);
    });
  }
};

Actions.init = function() {
  var destConfigJson = path.resolve('config.json');
  var destSettingsPhp = path.resolve('settings.php');

  if(fs.existsSync(destConfigJson) || fs.existsSync(destSettingsPhp)) {
    console.error('Configuration Already Exists'.bold.red);
    process.exit(1);
  }

  var exampleConfigJson = path.resolve(__dirname, '../example/config.json');
  var exampleSettingsPhp = path.resolve(__dirname, '../example/settings.php');

  copyFile(exampleConfigJson, destConfigJson);
  copyFile(exampleSettingsPhp, destSettingsPhp);

  console.log('Empty Configuration Initialized!'.bold.green);

  function copyFile(src, dest) {
    var content = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dest, content);
  }
};

function storeLastNChars(vars, field, limit, color) {
  return function(data) {
    vars[field] += data.toString();
    if(vars[field].length > 1000) {
      vars[field] = vars[field].substring(vars[field].length - 1000);
    }
  };
}

function whenAfterDeployed(buildLocation) {
  return function(error, summaryMaps) {
    rimraf.sync(buildLocation);
    whenAfterCompleted(error, summaryMaps);
  };
}

function whenAfterCompleted(error, summaryMaps) {
  var errorCode = error || haveSummaryMapsErrors(summaryMaps) ? 1 : 0;
  process.exit(errorCode);
}

function haveSummaryMapsErrors(summaryMaps) {
  return _.some(summaryMaps, hasSummaryMapErrors);
}

function hasSummaryMapErrors(summaryMap) {
  return _.some(summaryMap, function (summary) {
    return summary.error;
  });
}
