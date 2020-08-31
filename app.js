//gurwosh gitgit!!!


var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');      //특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역할
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var api = require('./api');
var mongoose = require('mongoose');
var connect = require('./db.js'); 
var fun = require('./function.js')
var renderfunc = require('./pagerender.js')
var fs = require('fs');
var multer = require('multer');




var database =  connect();   
var app = express();      //express 서버 객체
 
 
app.set('port', 3000);
app.set('view engine','ejs');
app.use(serveStatic(path.join('public', __dirname, 'public')));

app.use('/uploads',express.static('/uploads'));

var uploadDir = path.join(__dirname , './public/uploads'); 
 
var storage = multer.diskStorage({
    destination : function(req, file,callback) {
        callback(null, uploadDir);
    },
    filename :function(req, file, callback){
        callback(null, 'products-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

var upload = multer({storage: storage});





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
 
app.use('/api', api);  
 
 

var router = express.Router();

router.post('/process/write_submit', upload.single('thumbnail'),
    function (req, res)
    {
        console.log('/write_submit  라우팅 함수 실행');
        var paramID = req.session.user.id
        var patitle = req.body.title || req.query.title;
        var pacontents = req.body.contents || req.query.contents;
        var thumbnail = (req.file) ? req.file.filename :"";
        var point = req.session.user.point;
        
        if (req.session.user)      
        {   
            
            if(database){
                fun.plus_contents(database, patitle, pacontents, paramID, thumbnail,
                    function (err, result) {
                        if (err) {
                            console.log('Error!!!');
                            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                            res.write('<h1>에러발생</h1>');
                            res.end();
                            return;
                        }
     
                        if (result) {
                            var newpoint = point+100;

                            req.session.user =
                            {
                                id: req.session.user.id,
                                pw: req.session.user.pw,
                                name: req.session.user.name,
                                authorized: true,
                                point : newpoint,
                            };

                            fun.updatepoint(database,paramID,newpoint);    
                                                 
                            console.log(req.session.user);

                            renderfunc.sharepage_ren(database,paramID,req,res,newpoint);           
                         
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

            else{

                console.log('DB연결에러에여')
            }

        }
       
        else
        {
            res.redirect('/login.html');
            console.log('로그인부터 하고 오세여~~')
            
 
        }
    }
);
 

router.post('/delete/:id',upload.single('thumbnail'), function (req, res) {
   
    var paramID = req.session.user.id;
    var point = req.session.user.point;
  
    var newpoint = point-100;
    req.session.user =
    {
        id: req.session.user.id,
        pw: req.session.user.pw,
        name: req.session.user.name,
        authorized: true,
        point : newpoint,
    };

    fun.updatepoint(database,paramID,newpoint); 
    
    boardModel.findByIdAndRemove({_id: req.params.id}, function (err, docs) {

        if(docs.thumbnail !== ""){
        fs.unlink( uploadDir + '/' +docs.thumbnail, function(err){
            if(err){console.log('oops')}
            else {
                renderfunc.sharepage_ren(database,paramID,req,res,newpoint);
            }
        });
        }
        
        else{
            renderfunc.sharepage_ren(database,paramID,req,res,newpoint);
        }
       
    });
});



//라우터 미들웨어 등록하는 구간에서는 라우터를 모두  등록한 이후에 다른 것을 세팅한다
//그렇지 않으면 순서상 라우터 이외에 다른것이 먼저 실행될 수 있다
app.use('/', router);       //라우트 미들웨어를 등록한다
 

 

var errorHandler = expressErrorHandler(
    { static: { '404': './public/404.html' } }              //404 에러 코드가 발생하면 해당 페이지를 보여주는 예외 미들웨어
);
 
app.use(expressErrorHandler.httpError(404));
app.use(expressErrorHandler);
app.use(errorHandler);

//웹서버를 app 기반으로 생성
var appServer = http.createServer(app);
appServer.listen(app.get('port'),
    function () {
        console.log('express 웹서버 실행' + app.get('port'));
           
    }
);


