
var express = require("express");
var router = express.Router({mergeParams:true});
var Comment = require("../models/comment");
var Campground = require("../models/campgrounds");
//comments new
router.get("/new",isLoggedIn,function(req,res)
{
    var id = req.params.id;

    Campground.findById(id,function(err,foundCampground)
    {   //console.log("doubts====================="+foundCampground);
        if(err)
        console.log(err);
        else
        res.render("comments/new",{campground: foundCampground});
    });
});
//comments create
router.post("/",isLoggedIn,function(req,res)
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
//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
}
module.exports = router;