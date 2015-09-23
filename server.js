var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var sessions = require('express-session');
var RQ = require("./redis_query.js");

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade');
app.use(sessions({
    cookieName : 'session',
    secret : 'a',
    duration : 30*60*1000,
    activeDuration : 5*60*1000
}));
app.use(function(req,res,next){
    console.log("--------Middleware---------");
    if(req.session && req.session.user){
        RQ.CheckLogin(req.session.user.uid,req.session.user.password,function(e,user){
            if(user){
                req.user = user;
                req.session.user = user;
                res.locals.user = user;
            }
            next();
        });
    }
    else next();
});

function requireLogin(req, res, next){
    if(!req.user){
        res.redirect('/login');
    }else{
        next();
    }
}

var server = app.listen(5000, function (req,res) {
    console.log('Server : Listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
    res.render('base.jade');
});
app.get('/login', function (req, res) {
    res.render('login.jade');
});
app.get('/register', function (req, res) {
    res.render('register.jade');
});
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/dashboard',requireLogin  ,function (req, res) {
    res.render('dashboard.jade');
});

app.post('/login', function (req, res) {
    console.log("login request : "+JSON.stringify(req.body));
    var uid = req.body.uid;
    var password = req.body.password;
    RQ.CheckLogin(uid,password,function(e,user){
        if(user){
            req.session.user = user  ;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send({redirect: '/dashboard'});
        }
        else{
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send({redirect: '/login'});
        }
    });
});

app.post('/register', function (req, res) {
    console.log("Register request : "+JSON.stringify(req.body));
    var name = req.body.name;
    var email = req.body.email;
    var uid = req.body.uid;
    var password = req.body.password;
    RQ.NewUser(uid,password,name,email,function(e,o){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send({redirect: '/login'});
    });
});