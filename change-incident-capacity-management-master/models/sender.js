var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');
var senderSchema = new mongoose.Schema({
    name: String,
    email:String
});

module.exports = mongoose.model("sender",senderSchema);