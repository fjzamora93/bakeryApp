
const path = require('path');
const bodyParser = require('body-parser');

const recetasJSON = require('./data/recipes.json')

const express = require('express');
const app = express();
const adminRoutes = require('./routes/admin')
const recipeRoutes = require('./routes/recipes')

app.set('view engine', 'ejs')
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/recipes', recipeRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res, next) => {
    console.log(recetasJSON)
    res.render('index', {
        recetas: recetasJSON
    });
})

app.listen(3000);