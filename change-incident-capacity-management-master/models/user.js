var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    // changes:[
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "change"
    //     }
    // ],
    // incidentReq:[
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "incident"
    //     }
    // ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user",userSchema);