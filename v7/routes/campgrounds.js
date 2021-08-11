//index --- show all campgrounds
var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");

router.get("/",isLoggedIn,function(req,res)
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
router.get("/new",function(req,res)
{
    res.render("campgrounds/new");
});

//create --- add new campground to database
router.post("/",isLoggedIn,function(req,res)
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
router.get("/:id",function(req,res)
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
//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
}
module.exports = router;
