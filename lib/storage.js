/* eslint-disable global-require */
let type;
let saveModule;
let hasModule;
let getModule;
let saveProvider;
let hasProvider;
let getProvider;
console.log('storage.js start');
if (process.env.CITIZEN_STORAGE === 's3') {
  ({
    type, saveModule, hasModule, getModule,
    saveProvider, hasProvider, getProvider,
  } = require('../storages/s3'));
} else {
  ({
    type, saveModule, hasModule, getModule,
    saveProvider, hasProvider, getProvider,
  } = require('../storages/file'));
}
console.log('storage.js line 21',process.env.CITIZEN_STORAGE);

exports.type = type;
exports.saveModule = saveModule;
exports.hasModule = hasModule;
exports.getModule = getModule;
exports.saveProvider = saveProvider;
exports.hasProvider = hasProvider;
exports.getProvider = getProvider;
console.log('storage.js line 30 end');
