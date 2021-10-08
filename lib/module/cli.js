/* eslint-disable no-console */
const debug = require('debug');
const ora = require('ora');
console.log('m-cli.js start');
const {
  isValidNamespace,
  isValidName,
  isValidVersion,
  makeFileList,
  makeTarball,
} = require('../cli-helpers');
const { publish } = require('./module');

const owner = process.env.CITIZEN_MODULE_OWNER || '';

module.exports = async (namespace, name, provider, version, cmd) => {
  const verbose = debug('citizen:client');
  if (cmd.verbose) {
    debug.enable('citizen:client');
    console.log('m-cli.js line 20',namespace,name, provider, version);
  }

  const registryAddr = cmd.registry || process.env.CITIZEN_ADDR;
  console.log('m-cli.js line 24 registryAddr',registryAddr);

  if (!registryAddr) {
    console.error('Registry address must be specified.(with --registry or CITIZEN_ADDR)');
    process.exit(1);
  }
  verbose(`Target citizen registry server: ${registryAddr}`);

  if (!isValidNamespace(namespace)) {
    console.error('The namespace only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.');
    process.exit(1);
  }

  if (!isValidName(name)) {
    console.error('The name only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.');
    process.exit(1);
  }

  if (!isValidName(provider)) {
    console.error('The provider only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.');
    process.exit(1);
  }
  // It must be semantic version.
  const moduleversion = isValidVersion(version);
  if (!moduleversion) {
    console.error('The version must be a semantic version that can optionally be prefixed with a v. Examples are v1.0.4 and 0.9.2.');
    process.exit(1);
  }

  const targetDir = process.cwd();
  const moduleFullPath = `${namespace}/${name}/${provider}/${moduleversion}`;
  console.log('m-cli.js line 55 moduleFullPath',moduleFullPath);

  const spinner = ora();
  // compressing step
  let tarball;
  try {
    spinner.text = 'compress the terraform module';
    spinner.color = 'yellow';
    spinner.start();

    const files = await makeFileList(targetDir);
    console.log('m-cli.js line 66 targetDir',targetDir);
    verbose('files to compress: %O', files);
    tarball = await makeTarball(targetDir, files);
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    console.error(err);
    process.exit(1);
  }

  // publishing step
  try {
    spinner.text = `publish ${moduleFullPath}`;
    spinner.color = 'yellow';
    spinner.start();

    const res = await publish(registryAddr, moduleFullPath, tarball, owner);
    verbose(`response status code form registry: ${res.statusCode}`);
    console.log('m-cli.js line 84',res.statusCode);
    if (res.statusCode >= 400) {
      const { errors } = JSON.parse(res.body);
      const Jline84 = JSON.parse(res.body);
      console.log('m-cli.js line 85',Jline84);
      spinner.fail();
      console.error(`The registry server is something wrong: ${errors.map((msg) => `\n${msg}`)}`);
      process.exit(1);
    }

    spinner.succeed();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      spinner.fail();
      console.error('The registry server doesn\'t response. Please check the registry.');
      process.exit(1);
    }

    spinner.fail();
    console.error(err);
    console.log('m-cli.js line 101',err);
    process.exit(1);
  }
};
console.log('m-cli.js line 108 end');
