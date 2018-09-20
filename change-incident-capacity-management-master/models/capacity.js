var mongoose = require('mongoose');
//schema setup 
var capacitySchema = new mongoose.Schema({
    capacityNum: String,
    type: String,
    cost: String,
    detail: String,
    impact: String,
    location: String,
    date: {type: Date,default: Date.now},
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
        email:"String"
    },
    comments: String,
    appdate: Date,
    downtime: String
});

module.exports = mongoose.model("capacity",capacitySchema);