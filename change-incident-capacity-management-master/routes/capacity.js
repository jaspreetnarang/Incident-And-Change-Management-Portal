var express =  require('express'),
    nodemailer = require('nodemailer'),
    middleware = require('../middleware'),
    mongoose = require('mongoose'), 
    capacity = require('../models/capacity.js'),
    sender = require('../models/sender.js');

var router = express();
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
          rejectUnauthorized:false
        }
});

//show capacity
router.get("/capacity",middleware.isLoggedIn,function(req,res){
    console.log('From capacity');
    console.log("start :"+start_date);
    console.log("end :"+end_date);
        capacity.find({'requester.email' : req.user.email}).sort({_id : -1}).exec(function(err,allcapacity){
            if(err){
                console.log(err);
            }else{
                if(start_date && end_date){
                    var arr = [];
                    allcapacity.forEach(function(c){
                        var current_date = new Date(c['date']);
                        if(start_date <= current_date && current_date <= end_date){
                            arr.push(c);
                        }
                    });
                    if(arr === true){
                        //start_date = "" , end_date = "";
                        req.flash('error','No request made in the given time span');
                        res.render("capacity/capacity",{capacity: allcapacity});
                    }else{
                        //start_date = "" , end_date = "";
                        res.render("capacity/capacity",{capacity: arr});
                    }
                }else{
                    res.render("capacity/capacity",{capacity: allcapacity});
                }
            }
        });
});
router.post('/capacity/filter',function(req,res){
    start_date = new Date(req.body.start_date), end_date = new Date(req.body.end_date);
    res.redirect('/capacity');
});

//create route
router.post("/capacity",middleware.isLoggedIn,function(req,res){
    var type=req.body.capacity.type,
        reqName = req.body.capacity.reqName,
        cost = req.body.capacity.cost,
        impact = req.body.capacity.impact,
        detail = req.body.capacity.detail,
        sendTo = req.body.capacity.receiver,
        downtime = req.body.capacity.downtime,
        capacityNum = req.body.capacity.capacityNum;
   console.log(downtime);
    console.log(sendTo +":"+ req.body.capacity.receiver);
    
    var strHtml =   '<h3>Application for capacity Request</h3>'+
                    '<h4>Requesters Name : '+ reqName +'</h4><h4>Type : '+ type +'</h4><h4>Impact of Capacity : '+impact+'</h4><h4>Approximate Cost:' + cost +
                    '</h4><p><strong>Detail: </strong>'+ detail+ '</p><p><strong>DownTime Required: </strong>' +
                    downtime +'</p><br><a href="http://localhost:3000/capacity/' +
                    capacityNum + 
                    '/status/Approval1" >Link for approval /disapproval</a><br><br>';
    const mailOptions = {
                from: 'test1@dsgroup.com', // sender address
                to: sendTo, // list of receivers
                subject:  'Application for capacity Request , by: ' + reqName, // Subject line
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
    
    //Create a new capacity in db
    //======================================================
    capacity.create(req.body.capacity,function(err,capacity){
                if(err){
                    console.log(err);
                }
                else{
                    // sendmail(mailOptions);
                    //add email and id 
                    capacity.requester.id = req.user._id;
                    capacity.requester.email = req.user.email;
                    capacity.receiver.email = sendTo;
                    capacity.requester.username = req.user.username;
                    capacity.status = "Mail Sent/ Pending";
                    //save
                    capacity.save();
                    res.redirect("/capacity");
                }
            });
});

//new route
router.get("/capacity/new",middleware.isLoggedIn,function(req,res){
    capacity.find().countDocuments({}, function(err,allcapacity){
        if(err){
            console.log(err);
        }else{
            allcapacity++;
            sender.find({},function(err,sender){
                if(err){
                    console.log(err);
                }else{
                    res.render("capacity/newcapacity",{capacityId: allcapacity , sender: sender , username: req.user.username});
                }
            });
        }
    });
});


router.get("/capacity/approved",middleware.isLoggedIn,function(req,res){
    capacity.find({'requester.email' : req.user.email, $or: [ { status : 'Approved' }, { status : 'Disapproved'} ]}, function(err,allcapacity){
        if(err){
            console.log(err);
        }else{
            res.render("capacity/approved_capacity",{capacity: allcapacity});
        }
    });
});

router.get("/capacity/pending",middleware.isLoggedIn,function(req,res){
    capacity.find({'requester.email' : req.user.email , status : "Mail Sent/ Pending"}, function(err,allcapacity){
        if(err){
            console.log(err);
        }else{
            res.render("capacity/pending_capacity",{capacity: allcapacity});
        }
    });
});

router.get('/capacity/:id/status/:approval_id',function(req,res){
        res.render('capacity/capacity_status',{capacity : req.params.id, approval : req.params.approval_id});
});
router.post('/capacity/:id/status/:approval_id/approve/',function(req,res){
    var capacityId = req.params.id, approval = req.params.approval_id;
    if(approval === "Approval1"){
        capacity.findOne({capacityNum : capacityId},function(err,capacity){
            if(err){
                console.log(err);
            }else{
                console.log(capacity)
                var strHtml = '<h3>Application for capacity Request</h3>'+
                    '<h4>Requesters Name : '+ capacity['requester']['username'] +'</h4><h4>Type : '+ capacity['type'] +'</h4><h4>Impact of Capacity : '+capacity['impact']+'</h4><h4>Approximate Cost:' + capacity['cost'] +
                    '</h4><p><strong>Detail: </strong>'+capacity['detail'] +'</p><p><strong>DownTime Required: </strong>' +
                    capacity['downtime']  + '</p><br><a href="http://localhost:3000/capacity/' +
                    capacityId + 
                    '/status/Approval2" >Link for approval /disapproval</a><br><br>';
                
                const mailOptions = {
                            from: 'test1@dsgroup.com', // sender address
                            to: 'manglik.vid@gmail.com', // list of receivers
                            subject:  'Application for capacity Request , by: ' + capacity['requester']['username'], // Subject line
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
        capacity.update({capacityNum : req.params.id},{ $set: { status: 'Approved',appdate : approvingdate , comments : "NA" }},function(err,capacity){
            if(err){
                console.log(err);
            }
            console.log(capacity);
            res.send('Request Approved');
        });
    }
});
router.post('/capacity/:id/status/:approval_id/disapprove',function(req,res){
    var disapprovingdate = Date(), comments = req.body.comments;
    capacity.update({capacityNum : req.params.id},{ $set: { status: 'Disapproved' , appdate : disapprovingdate, comments : comments}},function(err,capacity){
        if(err){
            console.log(err);
        }
        console.log(capacity);
        res.send('Request Disapproved');
    });
});


module.exports = router;