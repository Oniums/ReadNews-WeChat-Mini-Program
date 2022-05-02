let Service = require('node-windows').Service;
 
let svc = new Service({
  name: 'API_Get',    //服务名称
  description: 'API定时获取', //描述
  script: 'C:/Program Files/Express/Get/bin/www' //nodejs项目要启动的文件路径
});
 
svc.on('install', () => {
  svc.start();
});
 
svc.install();