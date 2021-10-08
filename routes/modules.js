const { Router } = require('express');
const multiparty = require('multiparty');

const logger = require('../lib/logger');
const { parseHcl } = require('../lib/util');
const storage = require('../lib/storage');
const { saveModule, getModuleLatestVersion, findOneModule } = require('../stores/store');
console.log('modules.js start');
const router = Router();

// register a module with version
router.post('/:namespace/:name/:provider/:version', (req, res, next) => {
  const {
    namespace,
    name,
    provider,
    version,
  } = req.params;
  const destPath = `${namespace}/${name}/${provider}/${version}`;
  let tarball;
  let filename;
  let owner = '';
  console.log('modules.js line 23',destPath);
  const form = new multiparty.Form();

  form.on('error', (err) => {
    logger.error(`Error parsing form: ${err.stack}`);
    next(err);
  });
  console.log('modules.js line 30');

  form.on('part', async (part) => {
    part.on('error', (err) => {
      logger.error(`Error parsing form: ${err.stack}`);
      next(err);
    });
    console.log('modules.js line 37');

    const ownerBuf = [];
    const file = [];
    part.on('data', (buffer) => {
      if (!part.filename && part.name === 'owner') {
        ownerBuf.push(buffer);
      }
      if (part.filename) {
        file.push(buffer);
      }
    });
    part.on('end', async () => {
      if (!part.filename && part.name === 'owner') {
        owner = Buffer.concat(ownerBuf).toString();
      }
      if (part.filename) {
        ({ filename } = part);
        tarball = Buffer.concat(file);
      }
    });
  });

  form.on('close', async () => {
    try {
      const exist = await storage.hasModule(`${destPath}/${filename}`);
      if (exist) {
        const error = new Error('Module exist');
        error.status = 409;
        error.message = `${destPath} is already exist.`;
        console.log('modules.js line 67');
        return next(error);
      }

      const fileResult = await storage.saveModule(`${destPath}/${filename}`, tarball);
      const definition = await parseHcl(name, tarball);
      const metaResult = await saveModule({
        namespace,
        name,
        provider,
        version,
        owner,
        location: `${destPath}/${filename}`,
        definition,
      });

      if (fileResult && metaResult) {
        console.log('modules.js line 84',fileResult,metaResult);
        return res.status(201).render('modules/register', {
          id: destPath,
          owner,
          namespace,
          name,
          provider,
          version,
          published_at: new Date(),
        });
      }
      console.log('modules.js line 95');
      return next(new Error());
    } catch (e) {
      logger.error(e);
      console.log('modules.js line 99');
      return next(e);
    }
  });

  form.parse(req);
});

// https://www.terraform.io/docs/registry/api.html#get-a-specific-module
router.get('/:namespace/:name/:provider/:version', async (req, res, next) => {
  const options = { ...req.params };

  const module = await findOneModule(options);

  if (!module) {
    console.log('modules.js line 114');
    return next();
  }
  console.log('modules.js line 117');
  return res.render('modules/module', module);
});

// https://www.terraform.io/docs/registry/api.html#latest-version-for-a-specific-module-provider
router.get('/:namespace/:name/:provider', async (req, res, next) => {
  const options = { ...req.params };

  const module = await getModuleLatestVersion(options);

  if (!module) {
    console.log('modules.js line 128',module);
    return next();
  }
  console.log('modules.js line 131');
  return res.render('modules/latest-version', module);
});

module.exports = router;
console.log('modules.js line 136 end');
