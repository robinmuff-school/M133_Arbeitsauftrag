let column = 0;
let dragedtaskid = "";
loadPage();

async function loadPage() {
    document.getElementById("Container").innerHTML = "";

    let columns;
    let tasks;

    try {
        let columns_response = await fetch("/Columns");
        columns = await columns_response.json();
        let tasks_response = await fetch("/Tasks");
        tasks = await tasks_response.json();  
    } catch(err) {
        console.log(err);
        return;
    }

    for (i = 0; i < columns.length; i++) {
        let div = document.createElement("div");
        div.className = "column";
        div.id = "Column_" + columns[i].Title.replace(" ", "");
        div.style.height = "100vh";
        div.style.width = (100 / columns.length).toFixed(1) + "%";
        if (i % 2 == 1) {
            div.style.backgroundColor = "WhiteSmoke";
        }

        let divtitle = document.createElement("div");
        divtitle.className = "column_title";
        divtitle.style.backgroundColor = columns[i].Color;
        let title = document.createElement("label");
        title.innerText = columns[i].Title;
        divtitle.appendChild(title);

        let divcontent = document.createElement("div");
        divcontent.className = "column_content";
        divcontent.id = "Column_Content_" + i;
        divcontent.style.height = "100vh";
        divcontent.ondrop = drop;
        divcontent.ondragover = allowDrop;

        div.appendChild(divtitle);
        div.appendChild(divcontent);

        document.getElementById("Container").appendChild(div);
    }

    for (const task of tasks) {
        document.getElementById("Column_" + columns[task.Column].Title.replace(" ", "")).lastChild.appendChild(createTaskHTML(task.Id, task.Title));
    }

    for (i = 0; i < columns.length; i++) {
        let button = document.createElement("button");
        button.innerText = "+";
        button.id = "Button_NewTask_" + i;
        button.className = "button_addtask";
        button.style.width = "100%";
        button.style.height = "3%"
        button.addEventListener("click", newTask);
        document.getElementById("Column_" + columns[i].Title.replace(" ", "")).lastChild.appendChild(button);
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
    document.getElementById("Input_Title").focus();
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
    back.className = "button_tasks";
    back.id = "Button_Back_Task_" + id;
    back.addEventListener("click", editTask)
    back.innerText = "←";
    
    let del = document.createElement("button");
    del.className = "button_tasks";
    del.id = "Button_Delete_Task_" + id;
    del.addEventListener("click", deleteTask);
    del.innerText = "🗑";
    
    let forward = document.createElement("button");
    forward.className = "button_tasks";
    forward.id = "Button_Forward_Task_" + id;
    forward.addEventListener("click", editTask)
    forward.innerText = "→";

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
    let column;
    let columns;

    try {
        let columns_response = await fetch("/Columns");
        columns = await columns_response.json();
    } catch(err) {
        console.log(err);
        return;
    }

    for (let i = 0; i < ev.path.length; i++) {
        for (let y = 0; y < columns.length; y++) {
            if (ev.path[i].id == "Column_" + columns[y].Title.replace(" ", "")) {
                console.log(y)
                column = y;
            }
        }
    }

    const response = await fetch("/Tasks");
    let tasks = await response.json();
    tasks.forEach(element => {
            if (element.Id == dragedtaskid) {
                task = element;
            }
        }
    );

    task.Column = column;

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