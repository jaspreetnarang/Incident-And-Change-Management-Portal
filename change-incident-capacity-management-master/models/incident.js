var mongoose = require('mongoose');
//schema setup 
var incidentSchema = new mongoose.Schema({
    incidentNum: String,
    dateOfIncident : Date,
    date: {type: Date,default: Date.now},
    location: String,
    factsOfIncident: String,
    rca: String,
    discussion: String,
    correctivePlan: String,
    description : String,
    responsibility : String,
    startDate : Date,
    completionDate : Date,
    status: String,
    requester:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: "String",
        email: "String"
    },
    receiver:{
        email: "String"
    },
    comments: String,
    appdate: Date,
    downtime: String
});

module.exports = mongoose.model("incident",incidentSchema);
