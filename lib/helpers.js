var exec = require('child_process').exec;

exports.printHelp = function() {
  console.error('\nValid Actions');
  console.error('-------------');
  console.error('init          - Create sample deployment configuration');
  console.error('setup         - Setup the server');
  console.error('');
  console.error('deploy        - Deploy site to server');
};
