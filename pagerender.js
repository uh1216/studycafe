var express = require('express');
var path = require('path');
var http = require('http');
var fun = require('./function.js');

exports.mainpage_ren = function(paramID,req,res, paramPoint){

    res.render('main',{ title: 'Express', paramID, paramPoint});
    fun.sample(paramID);

}


exports.mydatapage_ren = function(database,paramID,req,res,paramPoint){

    dataModel.find({username: paramID},
        function(err,data)
        {
            if(err){
                console.log(err);
            }

            if(data.length >0 ){
                console.log(data)
                res.render('mydata',{ title: 'Express', paramID,data, paramPoint});
            }

            else {
                console.log('can not find user [ ' + data + ' ]');
                
                res.render('mydata',{ title: 'Express', paramID,data, paramPoint});
            }

        });

}

exports.sharepage_ren = function(database,paramID,req,res, paramPoint){
   
    boardModel.find({},
        function (err, docs)
        {
            if (err) {
               console.log(err);
            }
 
            if (docs.length > 0) {

                res.render('share',{ title: 'Express', paramID, docs, paramPoint});
               
            }
            else {
                console.log('can not find user [ ' + docs + ' ]');
                res.render('share',{ title: 'Express', paramID, docs, paramPoint});
                
            }
        }
    );

}


exports.writepage_ren = function(paramID,req,res,paramPoint){

    res.render('write',{ title: 'Express', paramID,paramPoint });
    fun.sample(paramID);

}