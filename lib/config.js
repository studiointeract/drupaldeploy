var cjson = require('cjson');
var path = require('path');
var fs = require('fs');
var helpers = require('./helpers');
var format = require('util').format;

exports.read = function() {
  var configJsonPath = path.resolve('config.json');
  if (fs.existsSync(configJsonPath)) {
    var configJson = cjson.load(configJsonPath);

    // Initialize options.
    configJson.env = configJson.env || {};

    // Validate servers.
    if(!configJson.servers || configJson.servers.length == 0) {
      configErrorLog('Server information does not exist');
    } else {
      configJson.servers.forEach(function(server) {
        var sshAgentExists = false;
        var sshAgent = process.env.SSH_AUTH_SOCK;
        if(sshAgent) {
          sshAgentExists = fs.existsSync(sshAgent);
          server.sshOptions = server.sshOptions || {};
          server.sshOptions.agent = sshAgent;
          server.sshOptions.agentForward = true;
        }

        if(!server.host) {
          configErrorLog('Server host does not exist');
        } else if(!server.username) {
          configErrorLog('Server username does not exist');
        } else if(!server.password && !server.pem && !sshAgentExists) {
          configErrorLog('Server password, pem or a ssh agent does not exist');
        } else if(!server.password && !server.pem && !sshAgentExists) {
          configErrorLog('Server password, pem or a ssh agent does not exist');
        } else if(!configJson.repository) {
          configErrorLog('SSH Clone URL to your repository does not exist');
        } else if(!configJson.branch) {
          configErrorLog('Branch does not exist');
        } else if(!configJson.web) {
          configErrorLog('Path to web root does not exist');
        } else if(!configJson.documentRoot) {
          configErrorLog('DocumentRoot does not exist');
        } else if(!configJson.installLocation) {
          configErrorLog('installLocation does not exist');
        }

        server.os = server.os || "linux";

        if(server.pem) {
          server.pem = rewriteHome(server.pem);
        }

        server.env = server.env || {};
        var defaultEndpointUrl =
          format("http://%s:%s", server.host, configJson.env['PORT'] || 80);
      });
    }

    //rewrite ~ with $HOME
    configJson.web = rewriteHome(configJson.web);

    return configJson;
  } else {
    console.error('config.json file does not exist!'.red.bold);
    helpers.printHelp();
    process.exit(1);
  }
};

function rewriteHome(location) {
  if(/^win/.test(process.platform)) {
    return location.replace('~', process.env.USERPROFILE);
  } else {
    return location.replace('~', process.env.HOME);
  }
}

function configErrorLog(message) {
  var errorMessage = 'Invalid config.json file: ' + message;
  console.error(errorMessage.red.bold);
  process.exit(1);
}

function getCanonicalPath(location) {
  var localDir = path.resolve(__dirname, location);
  if(fs.existsSync(localDir)) {
    return localDir;
  } else {
    return path.resolve(rewriteHome(location));
  }
}
