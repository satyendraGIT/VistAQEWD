var config = {
  managementPassword: 'Welcome12!',
  serverName: 'QEWD Server',
  port: 8090,
  poolSize: 1,
  database: {
    type: 'gtm'
  }
};

var routes = [
{
 path:'/api',
 module:'ewd-vistaQEWD/vistaApp.js'
}
];
var qewd = require('qewd').master;

qewd.start(config,routes);
