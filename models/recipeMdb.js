const getDb = require('../util/database').getDb;

module.exports = class RecipeMdb {
    constructor(nombre, descripcion){
        this.nombre = nombre;
        this. descripcion = descripcion
    }

    save() {
        const db = getDb();
        return db
          .collection('recipes')
          .insertOne(this)
          .then(result => {
            console.log(result);
          })
          .catch(err => {
            console.log(err);
          });
      }
}