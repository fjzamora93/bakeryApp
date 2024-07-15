//! DEPRECATED NO UTILIZAR!!! Esto es para funcionar con JSON, no con MongoDB

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
            const contenido = JSON.parse(data)
            callback(contenido);
        };
    });
};

module.exports = class Recipe{
    constructor(id=null, nombre="", descripcion="",  ingredientes = [""], instrucciones= [""],
        tiempo = "", dificultad = "", image="", 
        ){
            this.id = id;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.ingredientes = ingredientes;
            this.instrucciones = instrucciones;
            this.tiempo = tiempo, 
            this.dificultad = this.generateDificultad(dificultad),
            this.image = image;
            
            if (id === null){
                this.id = this.generateId(); 
            }
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


    //TODO: FUNCIONES PENDIENTES DE IMPLEMENTAR. ¿USAR BOTONES?
    editRecipe(){
        getRecipesFromFile(recetas => {
            let indice = recetas.findIndex(rect => rect.id === this.id);
            if (indice !== -1) {
                recetas[indice] = this;
                console.log(recetas[indice])
                fs.writeFile(rutaRecetas, JSON.stringify(recetas, null, 2), err => { 
                    if (err) {
                        console.log(err);
                    }; 
                });
            } else {
                console.log(`Objeto con id ${this.id} no encontrado en la lista.`);
            }
        })
    }

    deleteRecipe(id, callback){
        console.log(this);
    }

 
    static findOne(id, callback){
        getRecipesFromFile(recetas => {
            const receta = recetas.find(rec => rec.id === id);
            callback(receta)
        });
    };


    static findAll(callback){
        getRecipesFromFile(callback);
    }
    
    generateId(){
        // Generate a random number between 1 and 1000000
        let id = Math.floor(Math.random() * 1000000) + 1;
        id = this.nombre.replace(/\s/g, '-') + "-" +id.toString();
        console.log('Generated Id', id)
        return id;
    };

    generateDificultad(dificultad){
        switch(dificultad) {
            case "2":
                dificultad = "Requiere controlar bien tiempos y temperatura";
                break;
            case "3":
                dificultad = "Requiere controlar bien las cantidades";
                break;
            case "4":
                dificultad = "Requiere precisión en cantidades y tiempos, no admite muchas variaciones";
                break;
            default:
                dificultad = "Es una receta fácil y adaptable, acepta modificaciones";
                break;
        }
        return dificultad;
    };

}