const process = require('process');
const shell = require('shelljs');

if (!shell.which('docker')) {
  shell.echo('This script requires docker');
  shell.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 1 && typeof args[0] === 'string') {
  const containerName = args[0];
  const dockerCmd = `docker kill ${containerName}`;
  shell.exec(dockerCmd);
} else {
  shell.echo('This script requires one argument as the micro container name');
  shell.exit(1);
}
