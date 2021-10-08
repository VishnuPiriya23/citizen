const pino = require('pino');
console.log('logger.js start');

const loggerName = process.env.npm_package_name || 'citizen';

const logger = pino({ name: loggerName, level: 'error' });

module.exports = logger;
console.log('logger.js line 8 end');
