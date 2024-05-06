const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    artID: {
        type: String, 
        required: true
    },
    image: {
        data: Buffer,
        type: String
    },
    username: {
        type: String, 
        required: true
    },
    name:{
        type: String,
        required: true
    },
    phno:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    title: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: true
    },
    
});

const Quote = mongoose.model('Quote',quoteSchema);

module.exports = Quote;