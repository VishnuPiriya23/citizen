const globby = require('globby');
const tar = require('tar');
const semver = require('semver');
console.log('cli-helper.js start');
// The module must adhere to the requirements of terraform module.
// ref: https://www.terraform.io/docs/registry/modules/publish.html?#requirements

// The namespace follows username rule of github
// only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen
const namespaceRule = /^[a-zA-Z0-9]+-?[a-zA-Z0-9]+$/;
const isValidNamespace = (namespace) => namespaceRule.test(namespace);
console.log('cli-helper.js line 12',namespace);

// The name rule is
// alphanumeric characters or single hyphens, and cannot begin or end with a hyphen
const nameRule = /^[a-zA-Z0-9]+-?[a-zA-Z0-9]+$/;
const isValidName = (name) => nameRule.test(name);
console.log('cli-helper.js line 18',nameRule);

// The version must be semantic version.
const isValidVersion = (version) => semver.valid(version);

// The protocol version must be MAJOR.MINOR format.
// see https://www.terraform.io/docs/internals/provider-registry-protocol.html#response-properties
const protocolRule = /^[0-9]\.[0-9]$/;
const isValidProtocol = (version) => protocolRule.test(version);
console.log('cli-helper.js line 27',protocolRule);

const makeFileList = async (target = __dirname) => {
  const filelist = await globby(['**'], {
    cwd: target,
    gitignore: true,
  });
  console.log('cli-helpers.js line 34');
  return filelist;
};
console.log('cli-helper.js line 37',makeFileList);

const makeTarball = (target = __dirname, filelist = []) => new Promise((resolve, reject) => {
  const compressed = tar.create(
    {
      cwd: target,
      gzip: true,
    },
    filelist,
  );
  const buffers = [];

  compressed
    .on('data', (chunk) => {
      buffers.push(chunk);
    })
    .on('end', () => {
      resolve(Buffer.concat(buffers));
    })
    .on('error', (err) => {
      reject(err);
    });
});
console.log('cli-helpers.js line 60',makeTarball);

module.exports = {
  isValidNamespace,
  isValidName,
  isValidType: isValidName,
  isValidVersion,
  isValidProtocol,
  makeFileList,
  makeTarball,
};
console.log('cli-helper.js line 71 end');
