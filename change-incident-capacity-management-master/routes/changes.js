var express =  require('express'),
    nodemailer = require('nodemailer'),
    middleware = require('../middleware'),
    mongoose = require('mongoose'), 
    change = require('../models/change.js'),
    user = require('../models/user.js'),
    sender = require('../models/sender.js');

var router = express();
var senderId = ""; 
var start_date , end_date ;
var transporter = nodemailer.createTransport({
    debug: true,
    host: '10.1.25.58',
    port: 587,
    secure: false, 
    auth: {
        user: 'test1',
        pass: 'india@123'
    },
    tls:{
        rejectUnauthorized:false,
    }
});

//show changes
router.get("/change",middleware.isLoggedIn,function(req,res){
    console.log('From change');
    console.log("start :"+start_date);
    console.log("end :"+end_date);
        change.find({'requester.email' : req.user.email}).sort({_id : -1}).exec(function(err,allChanges){
            if(err){
                console.log(err);
            }else{
                if(start_date && end_date){
                    var arr = [];
                    allChanges.forEach(function(c){
                        var current_date = new Date(c['date']);
                        if(start_date <= current_date && current_date <= end_date){
                            arr.push(c);
                        }
                    });
                    if(arr === true){
                        //start_date = "" , end_date = "";
                        req.flash('error','No request made in the given time span');
                        res.render("changes/change",{change: allChanges});
                    }else{
                        //start_date = "" , end_date = "";
                        res.render("changes/change",{change: arr});
                    }
                }else{
                    res.render("changes/change",{change: allChanges});
                }
            }
        });
});

router.post('/change/filter',function(req,res){
    start_date = new Date(req.body.start_date), end_date = new Date(req.body.end_date);
    res.redirect('/change');
});

//create route
router.post("/change",middleware.isLoggedIn,function(req,res){
    var type=req.body.change.type,
        reqName = req.body.change.reqName,
        priority = req.body.change.priority,
        reason = req.body.change.reason,
        downtime = req.body.change.downtime,
        sendTo = req.body.change.receiver,
        changeNum = req.body.change.changeNum;
   
    console.log(sendTo +":"+ req.body.change.receiver);
    
    var strHtml =   '<h3>Application for Change Request</h3>'+
                    '<h4>Requesters Name : '+ reqName +'</h4><h4>Type : '+ type +'</h4><h4>Priority : '+priority+'</h4>' +
                    '<p><strong>Reason: </strong>'+reason + '<p><strong>DownTime Required: </strong>' +
                    downtime +'</p><br><a href="http://localhost:3000/change/' +
                    changeNum + 
                    '/status/Approval1" >Link for approval /disapproval</a><br><br>';
    const mailOptions = {
                from: 'test1@dsgroup.com', // sender address
                to: sendTo, // list of receivers
                subject:  'Application for Change Request , by: ' + reqName, // Subject line
                html: strHtml// plain text body
            };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            req.flash('error','Mail not sent check your email!');
            console.log(err);
        }else{
            req.flash('success','Your mail has been sent!');
            console.log("mail sent to pawan sir");
            console.log(info);
        }
    });
    
    //Create a new change in db
    //======================================================
    change.create(req.body.change,function(err,change){
                if(err){
                    console.log(err);
                }
                else{
                    // sendmail(mailOptions);
                    //add username and id 
                    change.requester.id = req.user._id;
                    change.requester.email = req.user.email;
                    change.requester.username = req.user.username;
                    change.receiver.email = sendTo;
                    //change.requester.id = senderId;
                    change.status = "Mail Sent/ Pending";
                    //save
                    change.save();
                    res.redirect("/change");
                }
            });
});

//new route
router.get("/change/new",middleware.isLoggedIn,function(req,res){
    change.find().countDocuments({}, function(err,allChanges){
        if(err){
            console.log(err);
        }else{
            allChanges++;
            sender.find({},function(err,sender){
                if(err){
                    console.log(err);
                }else{
                    res.render("changes/newchange",{changeId: allChanges , sender: sender , username : req.user.username});
                }
            });
        }
    });
});


router.get("/change/approved",middleware.isLoggedIn,function(req,res){
    change.find({'requester.email' : req.user.email, $or: [ { status : 'Approved' }, { status : 'Disapproved'} ] }, function(err,allChanges){
        if(err){
            console.log(err);
        }else{
            res.render("changes/approved_requests",{change: allChanges});
        }
    });
});

router.get("/change/pending",middleware.isLoggedIn,function(req,res){
    change.find({'requester.email' : req.user.email , status : "Mail Sent/ Pending"}, function(err,allChanges){
        if(err){
            console.log(err);
        }else{
            res.render("changes/pending_requests",{change: allChanges});
        }
    });
});

router.get('/change/:id/status/:approval_id',function(req,res){
        res.render("changes/change_status",{change : req.params.id, approval : req.params.approval_id});
});
router.post('/change/:id/status/:approval_id/approve/',function(req,res){
    var changeId = req.params.id, approval = req.params.approval_id;
    if(approval === "Approval1"){
        change.findOne({changeNum : changeId},function(err,changes){
            if(err){
                console.log(err);
            }else{
                console.log(changes)
                var strHtml = '<h3>Application for Change Request</h3>'+
                    '<h4>Requesters Name : '+ changes['requester']['username'] +'</h4><h4>Type : '+ changes['type'] +'</h4><h4>Priority : '+changes['priority']+'</h4>' +
                    '<p><strong>Reason: </strong>'+ changes['reason'] + '<p><strong>DownTime Required: </strong>' +
                    changes['downtime'] + '</p><br><a href="http://localhost:3000/change/' +
                    changeId + 
                    '/status/Approval2" >Link for approval /disapproval</a><br><br>';
                const mailOptions = {
                            from: 'test1@dsgroup.com', // sender address
                            to: 'manglik.vid@gmail.com', // list of receivers
                            subject:  'Application for Change Request , by: ' + changes['requester']['username'], // Subject line
                            html: strHtml// plain text body
                        };
                transporter.sendMail(mailOptions, function (err, info) {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("mail sent to santosh sir");
                        console.log(info);
                    }
                });
                res.send('Mail Sent');
            }
        });
    }
    else{
        var approvingdate = Date();
        console.log(approvingdate);
        change.update({changeNum : req.params.id},{ $set: { status: 'Approved' , appdate : approvingdate , comments : "NA"}},function(err,changes){
            if(err){
                console.log(err);
            }
            console.log(changes);
            res.send('Request Approved');
        });
    }
});
router.post('/change/:id/status/:approval_id/disapprove',function(req,res){
    var disapprovingdate = Date(), comments = req.body.comments;
    change.update({changeNum : req.params.id},{ $set: { status: 'Disapproved' , appdate : disapprovingdate, comments : comments}},function(err,changes){
        if(err){
            console.log(err);
        }
        console.log(changes);
        res.send('Request Disapproved');
    });
});

module.exports = router;