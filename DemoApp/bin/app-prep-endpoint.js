const shell = require('shelljs');
const process = require('process');
const path = require('path');

if (!shell.which('perl')) {
  shell.echo('This script requires perl');
  shell.exit(1);
}

const microPort = '9090';
const androidHost = '10.0.2.2';
const iosHost = '0.0.0.0';
const appFile = path.join(__dirname, '..', 'App.js');

const validArg = ['android', 'ios'];

const androidReplaceCmd = `perl -i -pe "s/^.*endpoint:\\K.*/ \\'http:\\/\\/${androidHost}:${microPort}\\'\\,/" ${appFile}`;
const iosReplaceCmd = `perl -i -pe "s/^.*endpoint:\\K.*/ \\'http:\\/\\/${iosHost}:${microPort}\\'\\,/" ${appFile}`;

const args = process.argv.slice(2);
if (args.length === 1 && validArg.includes(args[0])) {
  const platform = args[0];
  if (platform === 'android') {
    shell.exec(androidReplaceCmd);
  } else {
    shell.exec(iosReplaceCmd);
  }
} else {
  shell.echo('This script requires a single argument: "android" or "ios"');
  shell.exit(1);
}
