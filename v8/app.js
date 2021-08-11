var express       =   require("express");
var app           =   express();
var bodyParser    =   require("body-parser");
var request       =   require('request');
var MongoClient   =   require('mongodb').MongoClient;
var mongoose      =   require("mongoose");
var Campground    =   require("./models/campgrounds");
var seedDB        =   require("./seeds");
var Comment       =   require("./models/comment");
var passport      =   require("passport");
var LocalStrategy = require("passport-local");
var User          = require("./models/User");
const port        =   3000;

// requiring routes
var commentRoutes       = require("./routes/comments");
var indexRoutes        = require("./routes/index");
var campgroundRoutes    = require("./routes/campgrounds");

mongoose.connect("mongodb://localhost:27017/yelp_camp");
// will remove all the campgrounds whenever we start the server
seedDB();
//

//To use body-parser package
app.use(function(req,res,next){
     res.locals.currentUser= req.user;
     next();
})
app.use(bodyParser.urlencoded({extended: true}));

//To tell express to search for the public directory expicitly for style.css file
app.use(express.static(__dirname+'/public'));

//PASSPORT CONFIGURATION 
//to set up express-session
app.use(require("express-session")({
    secret:"nothing",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());// 
passport.deserializeUser(User.deserializeUser());
//To tell express that the extension is ejs
app.set("view engine","ejs");
// middleware 
//we are using this to send each route variable currentUser
app.use(function(req,res,next){
    res.locals.currentUser= req.user;
    next();// to continue with further codes
})

const ejsLint = require('ejs-lint');

app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes  );


// while using ()=> for function in ea6 don't put semicolon at the end of this function
app.listen(port ,function()
{
    console.log("server has started");
});