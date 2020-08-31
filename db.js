var mongoose = require('mongoose');


module.exports = () =>{


    var databaseURL = 'mongodb://localhost:27017/test';
  

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseURL);
 
    database = mongoose.connection;     //db와 연결 시도
    
    database.on('open',         //db 연결 될때의 이벤트
        function ()
        {
            console.log('data base 연결됨 ' + databaseURL);
            
 
            //몽구스는 스키마를 정의하고 해당 스키마에 해당 하는 데이터를 집어넣는 방식으로 테이블과 유사
            userSchema = mongoose.Schema({
                id: String,
                passwords: String,
                name: String,
                point : Number,
                
            });


            boardSchema = mongoose.Schema({

                title: String,
                contents: String,
                writername: String,
                thumbnail : String,
                
            });


            dataSchema = mongoose.Schema({

                username: String,
                dataid: String,
                title2: String,
                writername2: String,
                thumbnail2 : String,
                
            });
    
 
            //컬렏션과 스키마를 연결시킴
            boardModel = mongoose.model('board2',boardSchema);
            userModel = mongoose.model('users1', userSchema);
            dataModel = mongoose.model('data3',dataSchema)
           
            console.log('userModel 정의함');
            console.log('boardModel 정의함');
            console.log('dataModel 정의함');
        }
    );
 
    database.on('disconnected',         //db 연결 끊길떄
        function () {
            console.log('data base 연결 끊어짐');
        }
    );
 
    database.on('error',         //에러 발생하는 경우
        console.error.bind(console, 'mongoose 연결 에러')
    );
 
    return database; // userModel, userSchema ;
//}


}