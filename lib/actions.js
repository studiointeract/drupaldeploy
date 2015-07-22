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

  // var self = this;

  // var buildLocation = path.resolve('/tmp', uuid.v4());
  // var bundlePath = path.resolve(buildLocation, 'bundle.tar.gz');
  //
  // // spawn inherits env vars from process.env
  // // so we can simply set them like this
  // process.env.BUILD_LOCATION = buildLocation;
  //
  // var deployCheckWaitTime = this.config.deployCheckWaitTime;
  // var appName = this.config.appName;
  // var appPath = this.config.app;
  // var enableUploadProgressBar = this.config.enableUploadProgressBar;
  // var meteorBinary = this.config.meteorBinary;
  //
  // console.log('Building Started: ' + this.config.app);
  // buildApp(appPath, meteorBinary, buildLocation, function(err) {
  //   if(err) {
  //     process.exit(1);
  //   } else {
  //     var sessionsData = [];
  //     _.forEach(self.sessionsMap, function (sessionsInfo) {
  //       var taskListsBuilder = sessionsInfo.taskListsBuilder;
  //       _.forEach(sessionsInfo.sessions, function (session) {
  //         sessionsData.push({
  //           taskListsBuilder: taskListsBuilder,
  //           session: session
  //         });
  //       });
  //     });
  //
  //     async.mapSeries(
  //       sessionsData,
  //       function (sessionData, callback) {
  //         var session = sessionData.session;
  //         var taskListsBuilder = sessionData.taskListsBuilder;
  //         var env = _.extend({}, self.config.env, session._serverConfig.env);
  //         var taskList = taskListsBuilder.deploy(
  //           bundlePath, env,
  //           deployCheckWaitTime, appName, enableUploadProgressBar);
  //         taskList.run(session, function (summaryMap) {
  //           callback(null, summaryMap);
  //         });
  //       },
  //       whenAfterDeployed(buildLocation)
  //     );
  //   }
  // });
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
