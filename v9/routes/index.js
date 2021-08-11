// Initial page
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User    = require("../models/User");
router.get("/",function(req,res)
{
    res.render("landing");
})

// AUTH ROUTES
//============

//show register forms

router.get("/register",(req,res)=>{
    res.render("register");
  })
  //handle sign up logic
  router.post("/register",(req,res)=>{
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
  router.get("/login",(req,res)=>{
      res.render("login");
  })
  //handle up login logic
  router.post("/login",passport.authenticate("local",{
      successRedirect: "/campgrounds",
      failureRedirect : "/login"
  }),()=>{
  
  })
  
  //====
  //logout
  //======
  router.get("/logout",(req,res)=>{
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
module.exports = router;