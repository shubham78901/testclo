const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    subHeading:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    picture: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true
    },
    categories: {
        type: Array,
        required: false   
    },
    createdDate: {
        type: Date
    }
});


const post = mongoose.model('post', PostSchema);


module.exports ={post};