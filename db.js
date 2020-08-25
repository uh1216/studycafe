
const mongoose = require('mongoose');


module.exports = () =>{
mongoose.connect('mongodb://127.0.0.1:27017');
const db = mongoose.connection;
db.on('error',console.error);
db.once('open',()=>{
    console.log('connected to mongo DB server');

});
};


