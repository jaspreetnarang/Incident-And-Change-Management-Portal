var express =  require('express'),
   nodemailer = require('nodemailer'),
   middleware = require('../middleware'),
   incident = require('../models/incident.js'),
   user = require('../models/user.js'),
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

//view list
router.get("/incident",middleware.isLoggedIn,function(req,res){
   incident.find({'requester.email' : req.user.email}).sort({_id : -1}).exec(function(err,allIncidents){
        if(err){
            console.log(err);
        }else{
            if(start_date && end_date){
                    var arr = [];
                    allIncidents.forEach(function(c){
                        var current_date = new Date(c['date']);
                        if(start_date <= current_date && current_date <= end_date){
                            arr.push(c);
                        }
                    });
                    if(arr === true){
                        //start_date = "" , end_date = "";
                        req.flash('error','No request made in the given time span');
                        res.render("incidents/incident",{incident: allIncidents});
                    }else{
                        //start_date = "" , end_date = "";
                        res.render("incidents/incident",{incident: arr});
                    }
                }else{
                    res.render("incidents/incident",{incident: allIncidents});
                }
        }
    });
});
router.post('/incident/filter',function(req,res){
    start_date = new Date(req.body.start_date), end_date = new Date(req.body.end_date);
    res.redirect('/incident');
});



//post route
router.post("/incident",middleware.isLoggedIn,function(req,res){
    var rca=req.body.incident.rca,
        reqName = req.body.incident.reqName,
        location = req.body.incident.location,
        reason = req.body.incident.factsOfIncident,
        sendTo = req.body.incident.receiver,
        discussion = req.body.incident.discussion,
        description = req.body.incident.description,
        downtime = req.body.incident.downtime,
        incidentNum = req.body.incident.incidentNum;
        console.log(req.body.incident.incidentNum);
     var strHtml =   '<h3>Application for Incident Request</h3>'+
                    '<h4>Requesters Name : '+ reqName +'</h4><h4>RCA : '+ rca +'</h4><h4>location : '+location+'</h4><h4> Discussion with ISM :' + discussion + '</h4>'+
                    '<p><strong>Reason : </strong>'+reason + '</p><p><strong>Action Plan Description: </strong>'+ description +'<p><strong>DownTime Required: </strong>' +
                    downtime + '</p><br><a href="http://localhost:3000/incident/' +
                    incidentNum + 
                    '/status/Approval1" >Link for approval /disapproval</a><br><br>';
    const mailOptions = {
                from: 'test1@dsgroup.com', // sender address
                to: sendTo, // list of receivers
                subject:  'Application for Incident Request , by: ' + reqName, // Subject line
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
   incident.create(req.body.incident,function(err,incident){
   if(err){
      console.log(err);
   }else{
      req.flash('success','Your mail has been sent!');
      //add username and id 
      incident.incidentNum = incidentNum;
      incident.requester.id = req.user._id;
      incident.requester.username = req.user.username;
      incident.requester.email = req.user.email;
      incident.receiver.email = sendTo;
   //          incident.requester.id = senderId;
      incident.status = "Mail Sent/ Pending";
      //save
      incident.save();
      res.redirect("/incident");
      }
   });
});
//create new incident
router.get("/incident/new",middleware.isLoggedIn,function(req,res){
   incident.find().countDocuments({}, function(err,allincidents){
        if(err){
            console.log(err);
            res.render('back');
        }else{
            allincidents++;
            sender.find({},function(err,sender){
                if(err){
                    console.log(err);
                }else{
                    res.render("incidents/newincident",{incidentId: allincidents , sender: sender , username : req.user.username});
                }
            });
        }
   });
});

router.get("/incident/approved",middleware.isLoggedIn,function(req,res){
   incident.find({'requester.email' : req.user.email,  $or: [ { status : 'Approved' }, { status : 'Disapproved'} ]}, function(err,allIncidents){
        if(err){
            console.log(err);
        }else{
            res.render("incidents/approved_actionplan",{incident: allIncidents});
        }
    });
});


router.get("/incident/pending",middleware.isLoggedIn,function(req,res){
   incident.find({'requester.email' : req.user.email , status : "Mail Sent/ Pending"}, function(err,allincidents){
        if(err){
            console.log(err);
        }else{
            res.render("incidents/pending_actionplan",{incident: allincidents});
        }
    });
});

router.get('/incident/:id/status/:approval_id',function(req,res){
   res.render('incidents/incident_status',{incident : req.params.id,approval : req.params.approval_id}); 
});

router.post('/incident/:id/status/:approval_id/approve/',function(req,res){
    var incidentId = req.params.id, approval = req.params.approval_id;
    if(approval === "Approval1"){
        incident.findOne({incidentNum : incidentId},function(err,incidents){
            if(err){
                console.log(err);
            }else{
                console.log(incidents)
                var strHtml ='<h3>Application for Incident Request</h3>'+
                    '<h4>Requesters Name : '+ incidents['requester']['username'] +'</h4><h4>RCA : '+ incidents['rca'] +'</h4><h4>location : '+incidents['location']+'</h4><h4> Discussion with ISM :' + incidents['discussion'] + '</h4>'+
                    '<p><strong>Reason : </strong>'+incidents['factsOfIncident']+ '</p><p><strong>Action Plan Description: </strong>'+ incidents['description'] + '<p><strong>DownTime Required: </strong>' +
                     incidents['downtime'] +'</p><br><a href="http://localhost:3000/incident/' +
                     incidentId + 
                    '/status/Approval2" >Link for approval /disapproval</a><br><br>'; 
                const mailOptions = {
                            from: 'test1@dsgroup.com', // sender address
                            to: 'manglik.vid@gmail.com', // list of receivers
                            subject:  'Application for incident Request , by: ' + incidents['requester']['username'], // Subject line
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
    }else{
        var approvingdate = Date();
        console.log(approvingdate);
       incident.update({incidentNum : req.params.id},{ $set: { status: 'Approved' , appdate : approvingdate , comments : "NA"}},function(err,incidents){
            if(err){
                console.log(err);
            }
            console.log(incidents);
            res.send('Request Approved');
        });
    }
});
router.post('/incident/:id/status/:approval_id/disapprove',function(req,res){
    var disapprovingdate = Date(), comments = req.body.comments;
    incident.update({incidentNum : req.params.id},{ $set: { status: 'Disapproved' , appdate : disapprovingdate, comments : comments}},function(err,incidents){
        if(err){
            console.log(err);
        }
        console.log(incidents);
        res.send('Request Disapproved');
    });
});


module.exports = router;