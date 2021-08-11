var express    =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var request     =   require('request');
var MongoClient =   require('mongodb').MongoClient;
var mongoose    =   require("mongoose");
var Campground  =   require("./models/campgrounds");
var seedDB      =   require("./seeds");
var Comment     =   require("./models/comment");
var passport    =   require("passport");
var LocalStrategy = require("passport-local");
var User          = require("./models/User");
const port      =   3000;

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

// var campgrounds = 
// [
//     {name: "Creek", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRK--s_2dTGrKqTPpzXU5ZfX7sJp7J0rXFy1jIoDTv24ukUXDY2"},
//     {name: "Hill", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRK--s_2dTGrKqTPpzXU5ZfX7sJp7J0rXFy1jIoDTv24ukUXDY2"},
//     {name: "Mountain", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRK--s_2dTGrKqTPpzXU5ZfX7sJp7J0rXFy1jIoDTv24ukUXDY2"}
// ];

// Initial page
app.get("/",function(req,res)
{
    res.render("landing");
})

//index --- show all campgrounds
app.get("/campgrounds",function(req,res)
{
    // res.render("campgrounds",{camp:campgrounds});
     
    Campground.find({},function(err,allCampground)
    {
        if(err)
        console.log("Error");
        else
        res.render("campgrounds/index",{campground: allCampground});
    });
});

// new --- show form to create new campground
app.get("/campgrounds/new",function(req,res)
{
    res.render("campgrounds/new");
});

//create --- add new campground to database
app.post("/campgrounds",function(req,res)
{
    // extracting datas from name attributes since post request

    var name=req.body.name;
    var image=req.body.image;
    var desc=req.body.description;
    
    Campground.create(
    {
        name: name,
        image: image ,
        description: desc
    },
    function(err,newly)
    {
        if(err)
        console.log("Error");
        else
        res.redirect("/campgrounds");
    });
});

// This must be written after app.get("/campgrounds/new..) otherwsie if we want to 
// open  "/campgrounds/new" we end by opening the "/campgrounds/:id"

// Show --- shows more info about campground
app.get("/campgrounds/:id",function(req,res)
{
    var id=req.params.id;

    Campground.findById(id).populate("comments").exec(function(err,foundCampground)
    {
        if(err)
        console.log(err);
        else
        {
            console.log("Found Campground");
            console.log(foundCampground);
            res.render("campgrounds/show",{data: foundCampground});
        }
    });
});

// ==================
// comments routes
//===================

app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res)
{
    var id = req.params.id;

    Campground.findById(id,function(err,foundCampgrund)
    {
        if(err)
        console.log(err);
        else
        res.render("comments/new",{campground: foundCampgrund});
    });
});

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res)
{
    //extracting from url since url contains ID
    var id = req.params.id;

    //lookup campground using ID
    Campground.findById(id,function(err,foundCampground)
    {
        if(err)
        console.log(err);
        else
        {
            //extracting from name attributes
            var data = req.body.comment;

            // create new comment
            Comment.create(data,function(err,comment)
            {
                if(err)
                console.log(err);
                else
                {
                    foundCampground.comments.push(comment);
                    foundCampground.save();

                    //Redirecting to show page
                    res.redirect("/campgrounds/"+foundCampground._id);
                }
            });
        }
    });
});
// ===========
// AUTH ROUTES
//============

//show register forms

app.get("/register",(req,res)=>{
  res.render("register");
})
//handle sign up logic
app.post("/register",(req,res)=>{
    var newUser= new User({username: req.body.username});
    User.register(newUser,req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            return  res.render("register");
        }
        else
        {
          passport.authenticate("local")(req, res, ()=>{
              res.redirect("/campgrounds");
          })
        }
        
    })
})
// login form
app.get("/login",(req,res)=>{
    res.render("login");
})
//handle up login logic
app.post("/login",passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect : "/login"
}),()=>{

})

//====
//logout
//======
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/campgrounds");

})
//protecting access without authentication

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
}
// while using ()=> for function in ea6 don't put semicolon at the end of this function
app.listen(port ,function()
{
    console.log("server has started");
});