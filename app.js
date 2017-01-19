/**
 * Created by june on 2016/11/18.
 */

var express = require('express');
var app = express();
var router = require('./routes/index');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//引入数据库配置文件
var settings = require('./settings');
//引入flash插件
var flash = require('connect-flash');
//引入session会话插件
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
//使用flash插件
app.use(flash());

app.set('views',path.join(__dirname,'./views'));
app.set('view engine','ejs');


//使用session会话
app.use(session({
    secret:settings.cookieSecret,
    key:settings.db,
    cookie:{maxAge:1000*60*60*24*30},
    store:new MongoStore({
        url:'mongodb://localhost/test'
    }),
    resave:false,
    saveUninitialized:true

}));

router(app);



app.listen(3000,function () {
    console.log('node is ok');
});

module.exports = app;