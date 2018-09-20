var express =  require('express'),
    passport = require('passport'),
    middleware = require('../middleware'),
    sender = require('../models/sender.js'),
    user = require('../models/user.js'),
    change = require('../models/change.js'),
    capacity = require('../models/capacity.js'),
    incident = require('../models/incident.js');
var router = express();
var str = "";

router.get("/",middleware.isLoggedIn,function(req,res){
    var totalcr = 0 , approvedcr = 0 , pendingcr = 0 , disapprovedcr = 0;
    var totalir = 0 , approvedir = 0 , pendingir = 0 , disapprovedir = 0;
    var totalcapr = 0 , approvedcapr = 0 , pendingcapr = 0 , disapprovedcapr = 0;
    console.log(req.user);
    str = req.user.email;
    user.findOne({email : str}, function(err,data){
        if(err){
            console.log(err);
        }else{
            change.find({'requester.email' : req.user.email},function(err,changes){
               if(err){console.log(err);}
                totalcr = changes.length;
               console.log(totalcr);
               changes.forEach(function(change){
                   if(change["status"] === 'Approved'){
                       approvedcr++;
                   }else if(change["status"] === 'Disapproved'){
                       disapprovedcr++;
                   }else{
                        pendingcr++;
                   }
               });
                console.log("change :"+totalcr + ":" + approvedcr + ":" + pendingcr);
                incident.find({'requester.email' : req.user.email},function(err,incidents){
                   if(err){console.log(err);}
                    totalir = incidents.length;
                    console.log(totalir);
                    incidents.forEach(function(incident){
                        if(incident["status"] === 'Approved'){
                           approvedir++;
                        }else if(incident["status"] === 'Disapproved'){
                           disapprovedir++;
                        }else{
                            pendingir++;
                        }
                    });
                    console.log("incident :"+totalir + ":" + approvedir + ":" + pendingir);
                    capacity.find({'requester.email' : req.user.email},function(err,capacity){
                       if(err){console.log(err);}
                        totalcapr = capacity.length;
                        console.log(totalcapr);
                        capacity.forEach(function(capacity){
                            if(capacity["status"] === 'Approved'){
                               approvedcapr++;
                            }else if(capacity["status"] === 'Disapproved'){
                               disapprovedcapr++;
                            }else{
                                pendingcapr++;
                            }
                        });
                       res.render("home",{email: data , totalcr: totalcr, approvedcr: approvedcr, pendingcr: pendingcr, disapprovedcr : disapprovedcr, totalir: totalir, approvedir: approvedir, pendingir: pendingir, disapprovedir : disapprovedir, totalcapr: totalcapr, approvedcapr: approvedcapr, pendingcapr: pendingcapr, disapprovedcapr : disapprovedcapr});
                      });
                });    
            });
        }
    });
});

//For testing purpose
//============================================================
router.get("/register",function(req,res){
    res.render("register");
});
//save route
router.post("/register",function(req,res){
    console.log(req.body.email);
    user.register(new user({email: req.body.email,username: req.body.username}),req.body.password,function(err,user){
       if(err){
           console.log(err);
           return res.render('register');
       } 
       passport.authenticate("local")(req,res,function(){
           req.flash('success',"Successfully Registered!");
           console.log('Authenticate user');
           res.redirect("/");
       });
    });
});
router.get('/sender/save',function(req,res){
    res.render('sender');
});
router.post('/sender',function(req,res){
     sender.create(req.body.sender,function(err,sender){
               if(err){
                     console.log(err);
                }
                 else{
    //                 //save
     sender.save();
                    res.send("Added");
                }
            });
});
//===============================================================

router.get("/login",function(req,res){
    res.render("index");
});

router.post("/login",
    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect: "/login"
    }),function(req,res){
        
});
router.get('/logout',function(req,res){
    req.logout();
    res.redirect("/login");
});

module.exports = router;