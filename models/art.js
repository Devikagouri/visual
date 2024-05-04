const mongoose = require('mongoose');

const artSchema = new mongoose.Schema({
    image: {
        data: Buffer,
        type: String
    },
    username: {
        type: String, 
        required: true
    },
    title: {
        type: String, 
        required: true},
    description: {
        type: String, 
        required: true},
    theme: {
        type: String,
        required: true},
    price: {
        type: Number, 
        required: true},
    
});

const Artwork = mongoose.model('Artwork',artSchema);

module.exports = Artwork;