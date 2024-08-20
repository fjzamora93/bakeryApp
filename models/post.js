const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: false,
    },
    content : {
        type: String,
        required: true,
    },
    list: {
        type: String,
        required: false,
    },
    imgUrl: {  
        type: String,
        required: false,
    },
    attachedFile: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

module.exports = mongoose.model('Post', postSchema);