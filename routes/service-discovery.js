const { Router } = require('express');
console.log('service-discovery.js start');
const router = Router();

// ref: https://www.terraform.io/docs/internals/remote-service-discovery.html
router.get('/.well-known/terraform.json', (req, res) => {
  // match with https://registry.terraform.io/.well-known/terraform.json
  res.json({
    'modules.v1': '/v1/modules/',
    'providers.v1': '/v1/providers/',
  });
  console.log('service-discovery.js line 12',res);
});


module.exports = router;
console.log('service-discovery.js line 17 end');
