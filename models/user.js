var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    fb_id:String,
    fb_token:String,
    email:String,
    name: String,
    profile_photo:String,
    friends:Array
});

module.exports = mongoose.model("User", userSchema);