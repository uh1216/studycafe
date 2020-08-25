
const mongoose = require('mongoose');

var student = mongoose.Schema({
    
    id : 'string',
    passwords : 'string',
    name : 'string'
    
});

module.exports = mongoose.model('datadata',student);

/*module.exports = mongoose.model('데이터 베이스 이름 현재 Schema,user 2개있음!',student); */


