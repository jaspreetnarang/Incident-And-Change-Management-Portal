var mongoose = require('mongoose');
//schema setup 
var changeSchema = new mongoose.Schema({
    changeNum: String,
    reqName: String,
    type: String,
    priority: String,
    reason: String,
    date: {type: Date,default: Date.now},
    status: String,
    requester:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: "String",
        email:"String"
    },
    receiver:{
        email:"String"
    },
    comments: String,
    appdate: Date,
    downtime: String
});

module.exports = mongoose.model("change",changeSchema);
