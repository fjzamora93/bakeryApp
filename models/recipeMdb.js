const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion : {
        type: String,
        required: true,
    },
    ingredientes: {
        type: [String],
        required: true,
    },
    instrucciones: {
        type: [String],
        required:true,
    },
    tiempo:{
        type: String,
        required: true,
    },
    dificultad:{
        type:String,
        required: true,
    },
    categoria:{
        type:String,
    },
    image:{
        type: String,
    }
});

module.exports = mongoose.model('Recipe', recipeSchema);