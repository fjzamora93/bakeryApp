


function agregarIngrediente() {
    const ingredientesDiv = document.getElementById('bloque-ingredientes');
    const nuevoInput = document.createElement('input');
    const deleteButton = document.createElement('button');
    const addButton = document.createElement('button');

    // Set up the new input field
    nuevoInput.type = 'text';
    nuevoInput.name = 'ingredientes[]';
    nuevoInput.required = true;

    // Set up the delete button
    deleteButton.innerText = '-';
    deleteButton.className = 'button-delete';
    deleteButton.onclick = function() {
        // Remove the input field and the delete button
        ingredientesDiv.removeChild(nuevoInput);
        ingredientesDiv.removeChild(deleteButton);
        ingredientesDiv.removeChild(addButton);
    };

    // Set up the add button
    addButton.innerText = '+';
    addButton.className = 'button-add';
    addButton.onclick = agregarIngrediente;

    // Add the new input field and the buttons to the div
    ingredientesDiv.appendChild(nuevoInput);
    ingredientesDiv.appendChild(deleteButton);
    ingredientesDiv.appendChild(addButton);
}

function removeIngrediente(button) {
    const ingredientesDiv = document.getElementById('bloque-ingredientes');
    const ingredienteEliminar = button.previousElementSibling;
    ingredientesDiv.removeChild(ingredienteEliminar);
    ingredientesDiv.removeChild(button);
}