var express = require('express');
var path = require('path');
var http = require('http');



exports.sample = function(paramID){

     console.log(paramID);
     console.log('sample if fine!');
}



exports.addUser = function (db, id, passwords, name, callback) {
    console.log('add User 호출됨' + id + '  , ' + passwords);
 
 
    var user = new userModel({ "id": id, "passwords": passwords, "name": name, "point": 0});
 
    //user 정보를 저장하겠다는 함수
    user.save
    (
        function (err)
        {
            if (err)
            {
                callback(err, null);
                return;
            }
 
            //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
            console.log('사용자 추가 됨');
            callback(null, user);
        }
    );
 
};


 
exports.authUser = function (db, id, password, callback) {
    console.log('input id :' + id.toString() + '  :  pw : ' + password);
     
 
    userModel.find({ "id": id, "passwords": password },
        function (err, docs)
        {
            if (err) {
                callback(err, null);
                return;
            }
 
            if (docs.length > 0) {
                console.log('find user [ ' + docs + ' ]');
                callback(null, docs);
            }
            else {
                console.log('can not find user [ ' + docs + ' ]');
                callback(null, null);
            }
        }
    );
 
};


exports.plus_contents = function (db, title, contents, writername,thumbnail, callback) {
  
 
    var board = new boardModel({ "title": title, "contents": contents, "writername": writername, "thumbnail": thumbnail });
 
    //user 정보를 저장하겠다는 함수
    board.save
    (
        function (err)
        {
            if (err)
            {
                callback(err, null);
                return;
            }
 
            //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
            console.log('게시판 추가됨');
            callback(null, board);
        }
    );
 
};


exports.plus_data = function (db, username, dataid,title2, writername2, thumbnail2, callback) {
  
 
    var data = new dataModel({ "username": username, "dataid": dataid, "title2": title2, "writername2": writername2, "thumbnail2": thumbnail2 });
 
    //user 정보를 저장하겠다는 함수
    data.save
    (
        function (err)
        {
            if (err)
            {
                callback(err, null);
                return;
            }
 
            //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
            console.log('데이터 추가됨');
            callback(null, data);
        }
    );
 
};

exports.updatepoint = function(database,paramID, newpoint) {

    userModel.findOneAndUpdate({ id : paramID}, { $set: { point : newpoint}}, function (err, docs) {
        if(err){
            console.log(err);
        }
        else{
    

        }
    });

};

