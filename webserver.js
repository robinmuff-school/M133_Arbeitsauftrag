import { Application, Router, send } from "https://deno.land/x/oak@v6.3.1/mod.ts"

const app = new Application();
const router = new Router();

let tasks = [{Id: 0, Title: "LOL", Column: 0}];

router 
    .get("/", (context) => {
        return send(context, "Frontend/index.html");
    })
    .get("/files/:fileName", (context) => {
        const fileName = context.params.fileName;
        return send(context, "Frontend/" + fileName)
    })
    
    .get("/Tasks", (context) => {
        context.response.body = tasks;
    })
    .post("/Tasks", async (context) => {
        const task = await context.request.body({ type: "json" }).value;
        tasks = [
            ...tasks,
            task
        ];

        context.response.status = 200
        context.response.body = { message: 'OK' }
    })
    .delete("/Tasks:id", async context => {
        const id = await context.params.id.substring(1);
        let newtasks = []
        tasks.forEach(element => {
            if (element.Id != id) {
                newtasks.push(element);
            }
        });
        tasks = newtasks;

        context.response.status = 200
        context.response.body = { message: 'OK' }
    })
    .put("/Tasks:id", async context => {
        const id = context.params.id.substring(1);
        const task = await context.request.body({ type: "json" }).value;
        const index = tasks.findIndex(p => p.Id == id);
        tasks[index] = task;

        context.response.status = 200
        context.response.body = { message: 'OK' }
    })
app.use(router.routes());
app.listen({ port: 8000 });