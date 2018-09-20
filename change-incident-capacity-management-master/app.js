var express =  require('express'),
    bodyParser = require("body-parser"),
    nodemailer = require('nodemailer'),
    mongoose = require('mongoose'), 
    //change = require('./models/change.js'),
    flash = require('connect-flash'),
    user = require('./models/user.js'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');

var changeRoutes = require('./routes/changes'), 
    incidentRoutes = require('./routes/incidents'),
    capacityRoutes = require('./routes/capacity'),
    indexRoutes = require('./routes/index');

mongoose.connect("mongodb://localhost/change_incident");

var app = express();
app.use(require('express-session')({
    secret : "User",
    resave : false,
    saveUninitialized  : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended : true}));
//========================
app.use(bodyParser.json());
//========================
app.set("view engine","ejs");
app.use(flash());
passport.use(new LocalStrategy(user.authenticate()));//used to configure middleware for login
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use(express.static(__dirname + '/public'));

app.use(indexRoutes);
app.use(changeRoutes);
app.use(incidentRoutes);
app.use(capacityRoutes);

app.listen(3000,function(){
    console.log("Server On Port :3000");
});