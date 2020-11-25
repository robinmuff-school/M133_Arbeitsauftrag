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
            //CODE to Create HTML for Task    
        }
    } catch {}

    for (i = 0; i < divs.length; i++) {
        let button = document.createElement("button");
        button.innerText = "+";
        button.id = "Button_NewTask_" + i;
        document.getElementById(divs[i]).appendChild(button);
    }

    document.getElementById("Button_Close").addEventListener("click", function() {
        document.getElementById("Popup").style.display = "none";
    })
    document.getElementById("Popup").style.display = "none";
}