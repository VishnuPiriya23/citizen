const { post } = require('got');
const FormData = require('form-data');
const { exec } = require('child_process');
const verbose = require('debug')('citizen:client');
console.log('provider.js start');
const genShaSums = (fileNamePrefix, targetDir) => new Promise((resolve, reject) => {
  exec(`shasum -a 256 *.zip > ${fileNamePrefix}_SHA256SUMS`, { cwd: targetDir }, (err) => {
    if (err) {
      console.log('provider.js line 9',err.msg);
      return reject(err);
    }
    console.log('provider.js line 12');
    return resolve(`${fileNamePrefix}_SHA256SUMS`);
  });
});
console.log('provider.js line 16',genShaSums);

const sign = (shaSumsFile, targetDir, gpgKey) => new Promise((resolve, reject) => {
  let keyOption = '';
  if (gpgKey) {
    keyOption = `--default-key ${gpgKey} `;
  }
  exec(`gpg --detach-sign ${keyOption} --yes ${shaSumsFile}`, { cwd: targetDir }, (err) => {
    if (err) {
      console.log('provider.js line 25',err.msg);
      return reject(err);
    }
    console.log('provider.js line 28');
    return resolve(`${shaSumsFile}.sig`);
  });
});
console.log('provider.js line 32',sign);

const exportPublicKey = (gpgKey) => new Promise((resolve, reject) => {
  let keyId = '';
  if (gpgKey) {
    keyId = gpgKey;
  }
  exec(`gpg --export --armor ${keyId}`, (err, stdout, stderr) => {
    if (err) { return reject(err); }
    if (stderr) { return reject(stderr); }
    console.log('provider.js line 42',keyId);
    return resolve(stdout);
  });
});
console.log('provider.js line 46',exportPublicKey);
const publish = async (registryAddr, providerPath, data, files) => {
  verbose(`send post request to : ${registryAddr}/v1/providers/${providerPath}`);
  console.log('provider.js line 49',registryAddr,providerPath);
  const form = new FormData();
  form.append('data', JSON.stringify(data));
  const jdata=JSON.stringify(data);
  console.log('provider.js line 52',jdata);
  files.forEach((f, index) => {
  form.append(`file${index + 1}`, f.stream, { filename: f.filename });
  });

  const result = await post(`${registryAddr}/v1/providers/${providerPath}`, {
    body: form,
    hooks: {
      beforeError: [
        (error) => {
          /* eslint-disable no-param-reassign */
          if (error.code === 'ECONNREFUSED') {
            error.message = 'The registry server doesn\'t response. Please check the registry.';
          } else {
            const { response } = error;
            if (response && response.body) {
              const { errors } = JSON.parse(response.body);
              const Jline70 = JSON.parse(response.body);
              console.log('provider.js line 70',Jline70);
              error.name = `Duplicated (${response.statusCode})`;
              error.message = errors.map((msg) => `${msg}`).join('\n');
            }
          }
          console.log('provider.js line 76',registryAddr,providerPath);
          return error;
          /* eslint-enable no-param-reassign */
        },
      ],
    },
  });
  console.log('provider.js line 83',result);
  return result;
};

module.exports = {
  genShaSums,
  sign,
  exportPublicKey,
  publish,
};
console.log('provider.js line 93 end');
