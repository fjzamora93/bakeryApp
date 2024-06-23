


function addClick(button, name) {
    const parentDiv = button.parentNode;
    const nuevoInput = document.createElement('input');
    const deleteButton = document.createElement('button');
    const addButton = document.createElement('button');

    // Set up the new input field
    nuevoInput.type = 'text';
    nuevoInput.name = `${name}[]`;
    nuevoInput.required = true;

    // Set up the delete button
    deleteButton.innerText = '-';
    deleteButton.className = 'button-delete';
    deleteButton.onclick = function() {
        // Remove the input field and the delete button
        parentDiv.removeChild(nuevoInput);
        parentDiv.removeChild(deleteButton);
        parentDiv.removeChild(addButton);
    };

    // Set up the add button
    addButton.innerText = '+';
    addButton.className = 'button-add';
    addButton.onclick = addClick;

    // Add the new input field and the buttons to the div
    parentDiv.appendChild(nuevoInput);
    parentDiv.appendChild(deleteButton);
    parentDiv.appendChild(addButton);
}

function removeClick(button) {
    const parentDiv = button.parentNode;
    const inputEliminar = button.previousElementSibling;
    parentDiv.removeChild(inputEliminar);
    parentDiv.removeChild(button);
}