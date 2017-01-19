/**
 * Created by june on 2016/11/18.
 */

//首先引入数据库连接文件
var mongo = require('./db');

//User类的只要功能是为了完成数据的新增和查询操作，那么他是针对用户信息（user集合）来进行的
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.picUrl = 'timg.jpg'
}
module.exports = User;
User.prototype.save = function (callback) {
    var user = {
        name:this.name,
        password:this.password,
        email:this.email,
        picUrl:this.picUrl

    };
    //使用open方法打开数据库
    mongo.open(function (err,db) {
        if(err) {
            return callback(err);
        }
        //读取users集合
        db.collection('users',function (err,collection) {
            if(err) {
                return callback(err);
            }
            collection.insert(user,{safe:true},function (err,user) {
                mongo.close();
                if(err) {
                    return callback(err);
                }
                return callback(null,user);
            })
        })
    })
};
User.get = function (name,callback) {
    mongo.open(function (err,db) {
        if(err) {
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err) {
                return callback(err);
            }
            collection.findOne({name:name},function (err,user) {
                mongo.close();
                if(err) {
                    return callback(err);
                }
                return callback(null,user);
            })
        })
    })
};
User.update = function (name,picUrl,callback) {
    mongo.open(function (err,db) {
        if(err) {
            return  callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err) {
                return callback(err);
            }
            collection.update({name:name},{$set:{picUrl:picUrl}},{upsert:true});
            //重新查询数据 返回更改过头像的用户数据
            collection.findOne({name:name},function (err,user) {
                mongo.close();
                if(err) {
                    return callback(err);
                }
                console.log(user);
                return callback(null,user);
            })
        })
    })
};