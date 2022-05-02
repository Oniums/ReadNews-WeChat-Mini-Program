let Service = require('node-windows').Service;
 
let svc = new Service({
  name: 'Wechat_Server',    //服务名称
  description: '微信小程序项目服务器', //描述
  script: 'C:/Program Files/Express/Server/bin/www' //nodejs项目要启动的文件路径
});
 
svc.on('install', () => {
  svc.start();
});
 
svc.install();