/**
 * Created by june on 2016/11/18.
 */

var mongo = require('./db');

function Post(data) {
    this.name = data.name;
    this.title = data.title;
    this.content = data.content;
    this.picUrl = data.picUrl;

}
module.exports = Post;
Post.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() + '-' + (date.getMonth() + 1),
        day:date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute:date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        + ' ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())
        + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var content = {
        name:this.name,
        title:this.title,
        time:time,
        content:this.content,
        picUrl:this.picUrl
    };
    mongo.open(function (err,db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err) {
                mongo.close();
                return callback(err);
            }
            collection.insert(content,function (err) {
                mongo.close();
                if(err) {
                    return callback(err);
                }
                callback(null);//如果没有错误的情况下，保存文章，不需要返回数据
            })
        })
    })
};

Post.get = function (name,callback) {
    mongo.open(function (err,db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err) {
                mongo.close();
                return callback(err);
            }
            var query = {};
            if(name) {
                query.name = name;
            }
            collection.find(query).sort({time:-1}).toArray(function (err,docs) {
                mongo.close();
                if(err) {
                   return callback(err);
                }
                return callback(null,docs);//返回查询的文档。(数组形式)
            });
        })
    })
}