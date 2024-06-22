

function agregarIngrediente() {
    const ingredientesDiv = document.getElementById('bloque-ingredientes');
    const nuevoInput = document.createElement('input');
    nuevoInput.type = 'text';
    nuevoInput.name = 'ingredientes[]';
    nuevoInput.required = true;
    ingredientesDiv.appendChild(nuevoInput);
}