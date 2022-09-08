const todos = []; //variabel berisi array yang akan menampung beberapa object berisikan data-data Todo user. 
const RENDER_EVENT = 'render-todo'; //utk perubahan data (perpindahan todo dari incomplete menjadi complete, dan sebaliknya)
const SAVED_EVENT = 'saved-todo'; //array di event savedata
const STORAGE_KEY = 'TODO_APPS'; //Menyimpan data ke storage sesuai dengan key yang kita tentukan

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateId() { //untuk menghasilkan identitas unik
    return +new Date(); //manfaatkan +new Date() untuk mendapatkan timestamp pada JavaScript.
}

function generateTodoObject(id, task, timestamp, isCompleted) { //generateTodoObject utk membuat object baru dari data yang sudah disediakan dari inputan (parameter function)
    return {
        id,
        task,
        timestamp,
        isCompleted
    }
}

//fungsi addTodo() untuk membuat Todo 
function addTodo() {
    const textTodo = document.getElementById('title').value; //Kode document.getElementById("title").value berfungsi untuk mengambil elemen pada html
    const timestamp = document.getElementById('date').value;

    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false); //membuat sebuah object dari todo dengan memanggil helper generateTodoObject() utk mmbuat object baru
    todos.push(todoObject); //object tersebut disimpan pada array todos menggunakan metode push()

    document.dispatchEvent(new Event(RENDER_EVENT)); //object td ke-save di array. 
    //panggil custom event RENDER_EVENT pakai method dispatchEvent() untuk me-render data yang telah disimpan pada array todos.
    saveData();
}

function makeTodo(todoObject) {
    const textTitle = document.createElement('h2'); //document.createElement untuk membuat objek DOM, yakni elemen HTML. 
    textTitle.innerText = todoObject.task;

    const textTimestamp = document.createElement('p');
    textTimestamp.innerText = todoObject.timestamp;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textTimestamp);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `todo-${todoObject.id}`);

    if (todoObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        //undobutton sama dengn trashbutton memanggil undoTaskFromCompleted dan removeTaskFromCompleted 
        //masing - masing akan memindahkan todo dari selesai ke belum selesai, dan menghapus todo.

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(todoObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(todoObject.id);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        // tombol checkbutton memanggil addTaskToCompleted, yang mana akan memindahkan todo dari rak “Yang harus dilakukan” ke rak “Yang sudah dilakukan”.

        checkButton.addEventListener('click', function () {
            addTaskToCompleted(todoObject.id);
        });

        container.append(checkButton);
    }

    return container;
}

function removeTaskFromCompleted(todoId) {
    const todoTarget = findTodoIndex(todoId);

    if (todoTarget === -1) return;

    todos.splice(todoTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//saveData(); digunakan untuk webstorage agar pas di reload ga ilang

function undoTaskFromCompleted(todoId) {
    const todoTarget = findTodo(todoId);

    if (todoTarget == null) return;

    todoTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addTaskToCompleted(todoId) {
    //fungsi ini digunakan untuk memindahkan todo dari rak “Yang harus dilakukan” ke “Yang sudah dilakukan"

    const todoTarget = findTodo(todoId);
    //findTodo berfungsi untuk mencari todo dengan ID yang sesuai pada array todos

    if (todoTarget == null) return;

    todoTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    //merubah state isCompleted dari sebelumnya false ke true, kemudian panggil event RENDER_EVENT untuk memperbarui data yang ditampilkan.
    saveData();
}

function saveData() { //karena savedata adalah function maka dibuat func nya
    if (isStorageExist()) {
        const parsed = JSON.stringify(todos);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function findTodoIndex(todoId) {
    for (const index in todos) {
        if (todos[index].id === todoId) {
            return index;
        }
    }

    return -1;
}

function findTodo(todoId) {
    for (const todoItem of todos) {
        if (todoItem.id === todoId) {
            return todoItem;
        }
    }
    return null;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            todos.push(todo);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () { //ini juga buat saveData dan buat array nya
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function () { //ketika semua elemen HTML sudah dimuat menjadi DOM 
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTodo();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () { //membuat listener dari RENDER_EVENT, 
    // console.log(todos); //dengan menampilkan array todos menggunakan console.log()

    const uncompletedTODOList = document.getElementById('todos');
    const completedTODOList = document.getElementById('completed-todos');


    uncompletedTODOList.innerHTML = ''; //sblm update container todo harus bersih dengan mengambil property innerHTML = " "
    completedTODOList.innerHTML = '';


    for (const todoItem of todos) {
        const todoElement = makeTodo(todoItem);
        if (!todoItem.isCompleted) {
            uncompletedTODOList.append(todoElement);
        } else {
            completedTODOList.append(todoElement);
        }

    }

});