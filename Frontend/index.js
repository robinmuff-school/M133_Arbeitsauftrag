let column = 0;
let dragedtaskid = "";
loadPage();

async function loadPage() {
    let divs = ["ToDo_Content", "InProgress_Content", "Done_Content"];
    for (i = 0; i < divs.length; i++) {
        document.getElementById(divs[i]).innerHTML = "";
    }

    const response = await fetch("/Tasks");
    try {
        const tasks = await response.json();

        for (const task of tasks) {
            document.getElementById(divs[task.Column]).appendChild(createTaskHTML(task.Id, task.Title));
        }
    } catch {}

    for (i = 0; i < divs.length; i++) {
        let button = document.createElement("button");
        button.innerText = "+";
        button.id = "Button_NewTask_" + i;
        button.addEventListener("click", newTask);
        document.getElementById(divs[i]).appendChild(button);
    }

    document.getElementById("Button_Create").addEventListener("click", addTask);
    document.getElementById("Button_Close").addEventListener("click", function() {
        document.getElementById("Popup").style.display = "none";
    })
    document.getElementById("Popup").style.display = "none";
}

function newTask(button) {
    column = button.path[0].id.slice(-1);
    document.getElementById("Popup").style.display = "block";
}

async function addTask() {
    if (document.getElementById("Input_Title").value == "") {
        alert("Please enter a Title");
        return;
    }
    const response = await fetch("/tasks");
    let id = 0;
    try {
        const tasks = await response.json();
        id = tasks.length;
    } catch {}

    let task = {
        Id: id,
        Title: document.getElementById("Input_Title").value,
        Column: column
    }
        
    document.getElementById("Input_Title").value = "";

    await fetch(
        "/tasks",
        {
            body: JSON.stringify(task),
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST"
    });

    await loadPage();
}

function createTaskHTML(id, title) {
    let div = document.createElement("div");
    div.className = "Task";
    div.id = "task_" + id;
    div.draggable = true;
    div.ondragstart = drag;

    let p = document.createElement("p");
    p.innerText = title;
    
    let back = document.createElement("button");
    back.id = "Button_Back_Task_" + id;
    back.addEventListener("click", editTask)
    back.innerText = "Back";
    
    let del = document.createElement("button");
    del.id = "Button_Delete_Task_" + id;
    del.addEventListener("click", deleteTask);
    del.innerText = "Delete";
    
    let forward = document.createElement("button");
    forward.id = "Button_Forward_Task_" + id;
    forward.addEventListener("click", editTask)
    forward.innerText = "Forward";

    div.appendChild(p);
    div.appendChild(back);
    div.appendChild(del);
    div.appendChild(forward);

    return div;
}

async function deleteTask(button) {
    let id = button.path[0].id.slice(-1);
    
    await fetch(
        "/tasks:" + id,
        {
            method: "DELETE"
    });

    await loadPage();
}

async function editTask(button) {
    let task;
    let isForward = false;
    let id = button.path[0].id.slice(-1);
    if (button.path[0].id.includes("Forward")) isForward = true;

    const response = await fetch("/Tasks");
    let tasks = await response.json();
    tasks.forEach(element => {
            if (element.Id == id) {
                task = element;
            }
        }
    );
    
    if (isForward) if (task.Column != 2) task.Column++;
    if (!isForward) if (task.Column != 0) task.Column--;
    
    await fetch(
        "/Tasks:" + id,
        {
            body: JSON.stringify(task),
            headers: {
                'Content-Type': 'application/json'
            },
            method: "PUT"
    });

    await loadPage();
}

function allowDrop(ev) {
    ev.preventDefault();
}
  
function drag(ev) {
    dragedtaskid = ev.path[0].id.slice(-1);
}
  
async function drop(ev) {
    ev.preventDefault();
    let task;
    let column = ev.path[0].id;

    const response = await fetch("/Tasks");
    let tasks = await response.json();
    tasks.forEach(element => {
            if (element.Id == dragedtaskid) {
                task = element;
            }
        }
    );

    if (column.includes("ToDo")) {
        task.Column = 0;
    }
    if (column.includes("InProgress")) {
        task.Column = 1;
    }
    if (column.includes("Done")) {
        task.Column = 2;
    }

    await fetch(
        "/Tasks:" + dragedtaskid,
        {
            body: JSON.stringify(task),
            headers: {
                'Content-Type': 'application/json'
            },
            method: "PUT"
    });

    loadPage();
}