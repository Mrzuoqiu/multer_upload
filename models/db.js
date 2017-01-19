/**
 * Created by june on 2016/11/18.
 */
//连接数据库
//引入数据库配置文件
var settings = require('../settings');

//引入连接数据库的mongodb模块
var Mongodb = require('mongodb');
var Db = Mongodb.Db;
var Server = Mongodb.Server;
//创建数据库连接对象
var server = new Server(settings.host,settings.port);
var db = new Db(settings.db,server,{safe:true});

module.exports = db;