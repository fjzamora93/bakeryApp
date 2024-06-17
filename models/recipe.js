
const recipes = require('../data/recipes.json')


module.exports = class Recipe{

    constructor(nombre, image, descripcion, ingredientes){
        this.nombre = nombre;
        this.image = image;
        this.descripcion = descripcion;
        this.ingredientes = ingredientes;
    }

    addRecipe(){
        //TODO LO ESTÁ GUARDANDO EN LA LISTA, PERO NO SOBREESCRIBE EL ARCHIVO
        recipes.push(this);
        console.log(recipes);
    }

    editRecipe(){
        console.log(this);
    }

    deleteRecipe(){
        console.log(this);
    }

    static findOne(id){
        console.log(id);
    }

    static findAll(){
        console.log(id);
    }

}

