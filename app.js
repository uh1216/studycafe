var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');      //특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역할
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
 
var mongoose = require('mongoose');
 
 
 
var database;
 
var userSchema;
 
 
var userModel;
 
 
//몽고디비에 연결 ,  보통 웹서버 만든 직후 연결 , DB 먼저 연결 되도 상관 없음
//먼저 db를 가져온다 
function connectDB() {
    //localhost 로컬 호스트
    //:27017  몽고디비 포트
    //local db 생성시 만든 폴더 명
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
                
            });
            console.log('userSchema 정의함');
 
            //컬렏션과 스키마를 연결시킴
            userModel = mongoose.model('users', userSchema);
            console.log('userModel 정의함');
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
 
}
 
 
 
 
 
var app = express();      //express 서버 객체
 
 
app.set('port', 3000);
app.set('view engine','ejs');
app.use(serveStatic(path.join('public', __dirname, 'public')));
 
 
 
var bodyParser_post = require('body-parser');       //post 방식 파서
//post 방식 일경우 begin
//post 의 방식은 url 에 추가하는 방식이 아니고 body 라는 곳에 추가하여 전송하는 방식
app.use(bodyParser_post.urlencoded({ extended: false }));            // post 방식 세팅
app.use(bodyParser_post.json());                                     // json 사용 하는 경우의 세팅
//post 방식 일경우 end
 
 
 
app.use(serveStatic(path.join(__dirname, 'public')));
 
 
//쿠키와 세션을 미들웨어로 등록한다
app.use(cookieParser());
 
//세션 환경 세팅
//세션은 서버쪽에 저장하는 것을 말하는데, 파일로 저장 할 수도 있고 레디스라고 하는 메모리DB등 다양한 저장소에 저장 할 수가 있는데
app.use(expressSession({
    secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐 , 아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
    resave: true,
    saveUninitialized: true
}));
 
 
 
 
//라우트를 미들웨어에 등록하기 전에 라우터에 설정할 경로와 함수를 등록한다
//
//라우터를 사용 (특정 경로로 들어오는 요청에 대하여 함수를 수행 시킬 수가 있는 기능을 express 가 제공해 주는것)
var router = express.Router();

router.route('/main').get(
    function (req, res)
    {
        console.log('/process/product  라우팅 함수 실행');
 
        //세션정보는 req.session 에 들어 있다
        if (req.session.user)       //세션에 유저가 있다면
        {
            res.render('main',{ title: 'Express' });
        }
        else
        {
            res.redirect('/login.html');
            console.log('로그인부터 하고 오세여~~')
            
 
        }
    }
);


router.route('/process/logout').post(                      //설정된 쿠키정보를 본다
    function (req, res) {
        console.log('/process/loginout 라우팅 함수호출 됨');
 
        if (req.session.user) {
            console.log('로그아웃 처리');
            req.session.destroy(
                function (err) {
                    if (err) {
                        console.log('세션 삭제시 에러');
                        return;
                    }
                    console.log('세션 삭제 성공');
                    //파일 지정시 제일 앞에 / 를 붙여야 root 즉 public 안에서부터 찾게 된다
                    res.redirect('/login.html');
                }
            );          //세션정보 삭제
 
        } else {
            console.log('로긴 안되어 있음');
            res.redirect('/login.html');
        }
 
 
     
    }
);


 
router.route('/process/login').post(
    function (req, res) {
        console.log('process/login 호출됨');
        var paramID = req.body.id || req.query.id;
        var paramPW = req.body.passwords || req.query.passwords;
        console.log('paramID : ' + paramID + ', paramPW : ' + paramPW);
        
        if (req.session.user) {
            console.log('이미 로그인 되어 있음');
 
            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
            res.write('<h1>Already login.</h1>');
            res.write('[ID] : ' + paramID + ' [PW] : ' + paramPW);
            res.write('<a href="/main">go to main page</a>');
            res.end();
 
        }
        else{

        if (database) {
            authUser(database, paramID, paramPW,
                function (err, docs) {

                    


                    if (database) {
                        if (err) {
                            console.log('Error!!!');
                            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                            res.write('<h1>에러발생</h1>');
                            res.end();
                            return;
                        }
 
                        if (docs) {
                            console.dir(docs);
                            
                            req.session.user =
                                                {
                                                    id: paramID,
                                                    pw: paramPW,
                                                    name: 'UsersNames!!!!!',
                                                    authorized: true
                                                };

                            console.log(req.session.user);  
                            
                            if (req.session.user)       //세션에 유저가 있다면
                                {
                                    res.render('main',{ title: 'Express'});
                                }
                                else
                                {
                                    res.redirect('/login.html');
                        
                                }
                            res.end();

 
                        }
                        else {
                            console.log('empty Error!!!');
                            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                            res.write('<h1>user data not exist</h1>');
                            res.write('<a href="/login.html"> re login</a>');
                            res.end();
                        }
 
                    }
                    else {
                        console.log('DB 연결 안됨');
                        res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        res.write('<h1>databasae 연결 안됨</h1>');
                        res.end();
                    }
 
 
 
                }
              
            );
          }
        }
    }
);
 
 
router.route('/process/addUser').post(
 
    function (req, res) {
        console.log('process/addUser 호출됨');
        var paramID = req.body.id || req.query.id;
        var paramPW = req.body.passwords || req.query.passwords;
        var paramName = req.body.name || req.query.name;
        console.log('paramID : ' + paramID + ', paramPW : ' + paramPW);
 
        if (database) {
            addUser(database, paramID, paramPW, paramName,
                function (err, result) {
                    if (err) {
                        console.log('Error!!!');
                        res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        res.write('<h1>에러발생</h1>');
                        res.end();
                        return;
                    }
 
                    if (result) {
                        console.dir(result);
                        res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        res.write('<h1>Add Success</h1>');
                        res.write('<h1> name </h1>' + paramName);
                        res.write('<br><a href="/login.html"> re login </a>');
                        res.end();
                    }
                    else {
                        console.log('추가 안됨 Error!!!');
                        res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        res.write('<h1>can not add user</h1>');
                        res.write('<a href="/login.html"> re login</a>');
                        res.end();
                    }
 
                }
            );
        }
        else {
            console.log('DB 연결 안됨');
            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
            res.write('<h1>databasae 연결 안됨</h1>');
            res.end();
        }
 
    }
);
 
 
//라우터 미들웨어 등록하는 구간에서는 라우터를 모두  등록한 이후에 다른 것을 세팅한다
//그렇지 않으면 순서상 라우터 이외에 다른것이 먼저 실행될 수 있다
app.use('/', router);       //라우트 미들웨어를 등록한다
 
 
var authUser = function (db, id, password, callback) {
    console.log('input id :' + id.toString() + '  :  pw : ' + password);
 
    //cmd 에서 db.users  로 썻던 부분이 있는데 이때 이 컬럼(테이블)에 접근은 다음처럼 한다
    /*
    var users = database.collection("users");
    var result = users.find({ "id": id, "passwords": password });
    */
 
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
 
 
 
var addUser = function (db, id, passwords, name, callback) {
    console.log('add User 호출됨' + id + '  , ' + passwords);
 
 
    var user = new userModel({ "id": id, "passwords": passwords, "name": name });
 
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
 
 
 
 
var errorHandler = expressErrorHandler(
    { static: { '404': './public/404.html' } }              //404 에러 코드가 발생하면 해당 페이지를 보여주는 예외 미들웨어
);
 
app.use(expressErrorHandler.httpError(404));
app.use(expressErrorHandler);
 
//웹서버를 app 기반으로 생성
var appServer = http.createServer(app);
appServer.listen(app.get('port'),
    function () {
        console.log('express 웹서버 실행' + app.get('port'));
        connectDB();        //DB 연결 , DB 연결 먼저해도 상관 없음
    }
);


