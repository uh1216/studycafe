const mongoose = require('mongoose');
const db = require('./db.js');
const Student = require('./Schema.js');


db();

var newStudent = new Student({id:'gurwosh', passwords:'123441', name: 'name'});

newStudent.save(function(error, data){
    if(error){
        console.log(error);
    }else{
        console.log('Saved!')
    }
});
