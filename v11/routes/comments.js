var express     =  require('express');
var router      =  express.Router(); 

var Campground  =  require("../models/campground");
var Comment     =  require("../models/comment");
var middleware  =  require("../middleware");
// ==================
// comments routes
//===================

// comments new
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req,res)
{
    var id = req.params.id;

    Campground.findById(id,function(err,foundCampground)
    {
        if(err)
        console.log(err);
        else
        res.render("comments/new",{campground: foundCampground});
    });
}); 

// Comments create
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req,res)
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
                {   req.flash("error","something went wrong")
                    console.log(err);
                }
                else
                {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    
                    comment.save();
                 
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success","successfully created a comment");
                    //Redirecting to show page
                    res.redirect("/campgrounds/"+foundCampground._id);
                }
            });
        }
    });
});

//comment edit route
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwner, function(req,res)
{
    var campgroundId = req.params.id;
    var commentId = req.params.comment_id;

    Comment.findById(commentId,function(err,foundComment)
    {
        if(err)
        res.redirect("back");
        else
        res.render("comments/edit",{campgroundId: campgroundId, comment: foundComment});

        // back means to previous page
    });
});

// comment update route
router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwner , function(req,res)
{
    // params means from url

    var campgroundId = req.params.id;
    var commentId = req.params.comment_id;
    var data = req.body.comment;

    Comment.findByIdAndUpdate(commentId, data, function(err,foundComment)
    {
        if(err)
        res.redirect("back");
        else
        res.redirect("/campgrounds/"+campgroundId);
    });
});

// comment destroy route
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwner, function(req,res)
{
    var campgroundId = req.params.id;
    var commentId = req.params.comment_id;

    Comment.findByIdAndRemove(commentId,function(err)
    {
        if(err)
        res.redirect("back");
        else
        {
            req.flash("success","Comment deleted");
        }
        res.redirect("/campgrounds/"+campgroundId);
    });
});


module.exports = router;