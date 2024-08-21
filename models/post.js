const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {type: String,},
    description: {type: String},
    content : {
        type: String,
    },
    items: { type: [String] },
    steps: { type: [String] },
    tags: { type: [String] },
    url: { type: String },
    imgUrl: { type: String},
    attachedFile: { type: String },
    category: { type: String },
    date: { type: String },
    price: { type: Number },
    

    //Campos del post relacionados con la visita
    status: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    author:{type: Schema.Types.ObjectId, ref: 'author'},

});

module.exports = mongoose.model('Post', postSchema);