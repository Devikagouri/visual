const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    profileImg: {
        data: Buffer,
        type: String
    },
    name: {
        type: String, 
        required: true
    },
    username: {
        type: String, 
        required: true},
    email: {
        type: String, 
        required: true},
    phno: {
        type: String,
        required: true},
    password: {
        type: String, 
        required: true},
    location: {
        type: String, 
        required: true},
    bio: {
        type: String, 
        required: true},
});

const User = mongoose.model('User',userSchema);

module.exports = User;