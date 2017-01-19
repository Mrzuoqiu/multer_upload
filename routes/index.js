/**
 * Created by june on 2016/11/18.
 */
//引入登录和注册需要的User 类
var User = require('../models/user');
//引入发布需要的Post类
var Post = require('../models/post');
//引入加密模块
var crypto = require('crypto');
//引入文件上传配置文件
var upload = require('../models/userpic');



//页面的权限问题
// 如果未登录，访问不了post和退出页面
function checkLogin(req,res,next) {
    if(!req.session.user) {
        req.flash('error','你还未登录');
        return res.redirect('/login');
    }
    next();
}
//如果已经登录就访问不了登录和注册页面
function checkNotLogin(req,res,next) {
    if(req.session.user) {
        req.flash('error','你已登录');
        return res.redirect('/');
    }
    next();
}

module.exports= function (app) {
    //首页
    app.get('/',function (req,res) {
        var postName = null;
        var picUrl = '';
        if(req.session.user) {
            postName = req.session.user.name;
            picUrl = 'images/'+ req.session.user.picUrl;
        }
        Post.get(null,function (err,content) {
            if(err) {
                console.log(err);
            }
            // console.log(content);
            res.render('index',{
                title:'首页',
                user:req.session.user,
                error:req.flash('error').toString(),
                success:req.flash('success').toString(),
                content:content,
                userpic:picUrl
            })
        })
    });
    //登录页面
    app.get('/login',checkNotLogin);
    app.get('/login',function (req,res) {
        res.render('login',{
            title:'登录',
            user:req.session.user,
            error:req.flash('error').toString(),
            success:req.flash('success').toString(),
        })
    });
    //登录验证
    app.post('/login',function (req,res) {
        var data = req.body;

        var md5 = crypto.createHash('md5');
        var password = md5.update(data.password).digest('hex');

        User.get(data.username,function (err,user) {
            if(!user) {
                //说明用户不存在
                req.flash('error','用户不存在');
                return res.redirect('/register');
            }
            if(err) {
                req.flash('error',err);
                return res.redirect('/login');
            }
            if(user.password != password) {
                req.flash('error','密码错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登录成功');
            res.redirect('/');
        })

    });
    //注册页面
    app.get('/register',checkNotLogin);
    app.get('/register',function (req,res) {
        res.render('register',{
            title:'注册',
            user:req.session.user,
            error:req.flash('error').toString(),
            success:req.flash('success').toString(),
        })
    });
    //注册验证
    app.post('/register',function (req,res) {
        var data = req.body;
        console.log(data);
        var name = data.username;
        var password = data.password;
        var password_rep = data.password_rep;
        var email = data.email;
        //1.检查信息是否为空
        if(name == '' || password == '' || password_rep == '' || email == '') {
            req.flash('error','内容不能为空');
            return res.redirect('/register');
        }
        //2.检查两次输入密码是否一致
        if(password != password_rep) {
            req.flash('error','两次输入的密码不一致');
            return res.redirect('/register');
        }
        //3.对密码进行加密处理
        var md5 = crypto.createHash('md5');
        password = md5.update(password).digest('hex');
        var newUser = new User({
            name:name,
            password:password,
            email:email
        });
        User.get(newUser.name,function (err,user) {
            if(err) {
                req.flash('error',err);
                return res.redirect('/register');
            }
            if(user) {
                req.flash('error','用户名已存在');
                return res.redirect('/register');
            }
            newUser.save(function (err,user) {
                if(err) {
                    req.flash('error',err);
                }
                //如果没有错误
                req.session.user = newUser;
                req.flash('success','注册成功');
                res.redirect('/');
            })
        });

    });
    //发表文章页面
    app.get('/post',checkLogin);
    app.get('/post',function (req,res) {
        res.render('post',{
            title:'发布',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
            userpic:'images/'+ req.session.user.picUrl
        })
    });
    //发表文章验证
    app.post('/post',function (req,res) {
        var currentName = req.session.user.name;
        // console.log('touxianglujing' + req.session.user.picUrl);
        var data = {
            name:currentName,
            title:req.body.title,
            content:req.body.content,
            picUrl:req.session.user.picUrl
        };
        //验证内容是否为空
        if(req.body.title == '' || req.body.content == '') {
            req.flash('error','内容不能为空');
            return res.redirect('/post');
        }
        var post = new Post(data);
        post.save(function (err) {
            if(err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','发布成功');
            res.redirect('/');
        })
    });
    //上传头像
    app.get('/user',function (req,res) {
        res.render('userinfo',{
            title:'个人中心',
            user:req.session.user,
            error:req.flash('error').toString(),
            success:req.flash('success').toString(),
            userpic:'images/'+req.session.user.picUrl
        })
    });
    //上传头像行为
    app.post('/user',upload.single('userpic'),function (req,res) {
        // console.log(req.picUrl);
        if(req.picUrl) {

            User.update(req.session.user.name, req.picUrl, function (err, user) {
                if (err) {
                    req.flash('err', err);
                    res.redirect('/user');
                }
                req.session.user = user;
                // console.log(req.session.user);
                req.flash('success', '头像更换成功');
                res.redirect('/user');
            });
        }else {
            res.end("请选择图片后上传");
            // User.update(req.session.user.name, req.session.user.picUrl, function (err, user) {
            //     if (err) {
            //         req.flash('err', err);
            //         res.redirect('/user');
            //     }
            //     req.session.user = user;
            //     // console.log(req.session.user);
            //     req.flash('success', '头像更换成功');
            //     res.redirect('/user');
            // });
        }
    });



    //退出页面
    app.get('/logout',checkLogin);
    app.get('/logout',function (req,res) {
        req.flash('success','成功退出');
        req.session.user = null;
        res.redirect('/');
    })





};