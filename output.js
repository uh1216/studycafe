const express = require('express');
var app = express();
const mongoose = require('mongoose');
const db = require('./db.js');
const Student = require('./Schema.js');



app.get('/', function(req, res, next) {

  Student.find({},function(err,students){

       if(err) console.log('err');

       console.log(students);
       res.send(students);

  });

});






 




  app.listen(8080, () => {
    db();
    console.log('Express App on port 8080!');
  });

