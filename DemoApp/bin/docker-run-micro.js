const path = require('path');
const process = require('process');
const shell = require('shelljs');
const waitOn = require('wait-on');

if (!shell.which('docker')) {
  shell.echo('This script requires docker');
  shell.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 1 && typeof args[0] === 'string') {
  const containerName = args[0];

  const microPort = '9090';
  const microAll = `http://0.0.0.0:${microPort}/micro/all`;
  const microMountPath = path.join(shell.pwd().toString(), 'tests');

  const dockerCommand = `docker run --detach --rm --name ${containerName} --mount type=bind,source=${microMountPath}/micro,destination=/config -p ${microPort}:9090 snowplow/snowplow-micro:1.1.2 --collector-config /config/micro.conf --iglu /config/iglu.json`;

  shell.exec(dockerCommand);

  var opts = {
    resources: [microAll],
    delay: 1000,
    interval: 100,
    timeout: 10000,
  };

  waitOn(opts)
    .then(function () {
      shell.echo('Micro listening on port 9090!');
    })
    .catch(function (err) {
      shell.echo(`Could not connect to Micro: ${err.message}`);
      shell.exit(1);
    });
} else {
  shell.echo('This script requires one argument as the micro container name');
  shell.exit(1);
}
