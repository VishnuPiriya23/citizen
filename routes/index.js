const { Router } = require('express');
console.log('index.js start');
const router = Router();

router.get('/health', (req, res) => {
  res.send('ok');
  console.log('index.js line 7');
});

module.exports = router;
console.log('index.js line 11 end');
