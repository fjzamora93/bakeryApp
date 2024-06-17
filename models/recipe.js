const fs = require('fs');
const recipes = require('../data/recipes.json');
const path = require('path');

const rutaRecetas = path.join(
    path.dirname(require.main.filename),
    'data',
    'recipes.json'
);

const getRecipesFromFile = callback => {
    fs.readFile(rutaRecetas, (err, data) => {
        if (err){
            console.log('error')
            callback([]);
        } else {
            console.log('archivo leido con éxito')
            const contenido = JSON.parse(data)
            callback(contenido);
        };
    });
};

module.exports = class Recipe{
    constructor(nombre, image, descripcion, ingredientes){
        this.nombre = nombre;
        this.image = image;
        this.descripcion = descripcion;
        this.ingredientes = ingredientes;
    }

    addRecipe(){
        getRecipesFromFile(recetas => {
            recetas.push(this);
            // Los parámetros adicionales de stringfy es para que me mantenga un  formato rico
            fs.writeFile(rutaRecetas, JSON.stringify(recetas, null, 2), err => { 
                console.log(err)
            });
        });
    }

    editRecipe(){
        console.log(this);
    }

    deleteRecipe(){
        console.log(this);
    }

    

    //!TODO AÚN NO SÉ SI ESTÁ BIEN
    static findOne(id, callback){
        console.log("Id: ", id);
        getRecipesFromFile(recetas => {
            const receta = recetas.find(rec => rec.id === id);
            callback(receta)
        });
    };


    static findAll(callback){
        getRecipesFromFile(callback);
    }
    

}

