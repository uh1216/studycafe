var express = require('express');
var expressSession = require('express-session');
var router = express.Router();
var fun = require('./function.js')
var renderfunc = require('./pagerender.js')

// middleware that is specific to this router



router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});




//페이지 이동관력

//메인페이지로
router.route('/process/main').post(
    function (req, res)
    {
        console.log('/main  라우팅 함수 실행');
        var paramID = req.session.user.id;
        var paramPoint = req.session.user.point;
    
        if (req.session.user)       
        {    
            
            renderfunc.mainpage_ren(paramID,req,res,paramPoint);

        }

        else
        {
            res.redirect('/login.html');
            console.log('로그인부터 하고 오세여~~')
            
 
        }
    }
);

// 내가 담은 자료 조회 화면으로
router.route('/process/mydata').post(
    function (req, res)
    {
        console.log('/process/mydata  라우팅 함수 실행');
        var paramID = req.session.user.id
        var paramPoint = req.session.user.point;
    
        if (req.session.user)       
        {    
            
            renderfunc.mydatapage_ren(database,paramID,req,res,paramPoint);

        }

        else
        {
            res.redirect('/login.html');
            console.log('로그인부터 하고 오세여~~')
            
 
        }
    }
);


//즐겨찾기

router.route('/process/addmydata').post(function(req,res)

{
    var paramID = req.session.user.id
    var paramdataID = req.body.dataid;
    var title2 = req.body.datatitle;
    var writer2 = req.body.datawriter;
    var thumbnail2 = req.body.datathumbnail;
    var paramPoint = req.session.user.point;


    if(req.session.user){

        if(database){
                fun.plus_data(database,paramID,paramdataID,title2,writer2,thumbnail2, function(err, data) {
                    if (err) {
                        console.log('Error!!!');
                        res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        res.write('<h1>에러발생</h1>');
                        res.end();
                        return;
                    }

                    if (data) {
                        renderfunc.mydatapage_ren(database,paramID,req,res,paramPoint);
                    }
                    else {
                        console.log('추가 안됨 Error!!!');
                        res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        res.write('<h1>can not add user</h1>');
                        res.write('<a href="/login.html"> re login</a>');
                        res.end();
                    }

                });
            }


            else{
                    console.log('DB연결에러에여')
            }

    }            
    else{

        res.redirect('/login.html');
        console.log('로그인부터 하고 오세여~~')

    }            
    

});



//즐겨찾기제거

router.get('/mydatadelete/:id', function (req, res) {
    var paramID = req.session.user.id;
    var paramPoint = req.session.user.point;

    
    dataModel.findByIdAndRemove({_id: req.params.id}, function (err, docs) {

        if(err){
            console.log('opps!!');
        }

        else{
            renderfunc.mydatapage_ren(database,paramID,req,res,paramPoint);
        }
       
    });
});




//게시글자세히보기

router.get('/docs/:id', function (req, res) {
    var paramID = req.session.user.id;
    var paramPoint = req.session.user.point;

    boardModel.findOne({_id: req.params.id}, function (err, docs) {
        dataModel.find({username: paramID},
            function(err,data)
            {
                if(err){
                    console.log(err);
                }
    
                if(data.length >0 ){
                    console.log(data)
                    res.render('board', { title: 'Board', docs, paramID,data, paramPoint});
                }
    
                else {
                    console.log('can not find user [ ' + data + ' ]');
                    
                    res.render('board', { title: 'Board', docs, paramID,data, paramPoint});
                }
    
            });
    
       
    })
});



//글조회하기페이지로 이동하기
router.route('/process/share').post(
    function (req, res)
    {
        console.log('/share  라우팅 함수 실행');
        var paramID = req.session.user.id;
        var paramPoint = req.session.user.point;
        
        if (req.session.user)      
        {    
            renderfunc.sharepage_ren(database,paramID,req,res, paramPoint);
            
        }
        else
        {
            res.redirect('/login.html');
            console.log('로그인부터 하고 오세여~~')
            
 
        }
    }
);




//글쓰기 페이지로 이동하기
router.route('/process/go_write').post(
    function (req, res)
    {
        console.log('/go_write  라우팅 함수 실행');
        var paramID = req.session.user.id
        var paramPoint =req.session.user.point
        
        if (req.session.user)      
        {    
            renderfunc.writepage_ren(paramID,req,res,paramPoint);
            
        }
        else
        {
            res.redirect('/login.html');
            console.log('로그인부터 하고 오세여~~')
            
 
        }
    }
);




//기능 관련



//로그아웃
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






//로그인
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
            res.write('<form method="post" action="/api/process/main"><button>go to main page</button></form>');
            res.end();
 
        }
        else{

        if (database) {
            fun.authUser(database, paramID, paramPW,
                function (err, docs) {

                        if (err) {
                            console.log('Error!!!');
                            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                            res.write('<h1>에러발생</h1>');
                            res.end();
                            return;
                        }
 
                        if (docs) {
                            console.log(docs);
                            
                            req.session.user =
                                                {
                                                    id: paramID,
                                                    pw: paramPW,
                                                    name: docs[0].name,
                                                    authorized: true,
                                                    point : docs[0].point
                                                };

                            console.log(req.session.user);  
                            
                            if (req.session.user)       //세션에 유저가 있다면
                                {   
                                    renderfunc.mainpage_ren(paramID,req,res,docs[0].point);
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
              
            );
            }
          else {
            console.log('DB 연결 안됨');
            res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
            res.write('<h1>databasae 연결 안됨</h1>');
            res.end();
        }
          }
        }
    
);






//회원가입
router.route('/process/addUser').post(
 
    function (req, res) {
        console.log('process/addUser 호출됨');
        var paramID = req.body.id || req.query.id;
        var paramPW = req.body.passwords || req.query.passwords;
        var paramName = req.body.name || req.query.name;
        console.log('paramID : ' + paramID + ', paramPW : ' + paramPW);
 
        if (database) {
            fun.addUser(database, paramID, paramPW, paramName,
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


module.exports = router;












//글등록하기
/*
router.post('/process/write_submit', upload.single('thumbnail'),csrProtection,
    function (req, res)
    {
        console.log('/write_submit  라우팅 함수 실행');
        var paramID = req.session.user.id
        var patitle = req.body.title || req.query.title;
        var pacontents = req.body.contents || req.query.contents;
        var thumbnail = (req.file) ? req.file.filename :"";
        
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
                            console.dir(result);
                            renderfunc.sharepage_ren(database,paramID,req,res);
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

*/




//자신이쓴게시글지우기
/*
router.post('/delete/:id', function (req, res) {
    var paramID = req.session.user.id;

    boardModel.findByIdAndRemove({_id: req.params.id}, function (err, docs) {
        renderfunc.sharepage_ren(database,paramID,req,res);
    })
});
*/