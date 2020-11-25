import { Application, Router, send } from "https://deno.land/x/oak@v6.3.1/mod.ts"

const app = new Application();
const router = new Router();

let tasks = [];

router 
    .get("/", (context) => {
        return send(context, "Frontend/index.html");
    })
    .get("/files/:fileName", (context) => {
        const fileName = context.params.fileName;
        return send(context, "Frontend/" + fileName)
    })
app.use(router.routes());
app.listen({ port: 8000 });