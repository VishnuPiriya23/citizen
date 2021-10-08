const http = require('http');
const debug = require('debug')('citizen:server');
console.log('server.js start');
const app = require('../app');

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    console.log('server.js line 11',port);
    return val;
  }

  if (port >= 0) {
    // port number
    console.log('server.js line 17',port);
    return port;
  }
  console.log('server.js line 20',port);
  return false;
};
console.log('server.js line 23');

const run = () => {
  const port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  const server = http.createServer(app);
  server.listen(port);
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      console.log('server.js line 33');
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`); // eslint-disable-line no-console
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`); // eslint-disable-line no-console
        process.exit(1);
        break;
      default:
        console.log('server.js line 50');
        throw error;
    }
  });
  console.log('server.js line 54');
  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
    console.log('server.js line 59',addr);
  });
};

module.exports = run;
console.log('server.js line 64');
