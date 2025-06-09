import Env         from "./env";
import controllers from './controller/all'
import errors      from "./errors";
import app from "./app";
import loader from "./loader";

const host = process.env.HOST;
const port = process.env.PORT;

console.log(process.cwd());

// init 
Env.getInstance().app = app();

// register routes
controllers()

// use our custom error handling middleware
//  for some reason this has to be used after controllers are imported
//  not really sure why this is, but it will break if it's before!
Env.getInstance().app.use(errors)

// load components like DB and spotify, then start app
loader().then(() => {
    // start app
    Env.getInstance().logger.info(`Starting server on http://${host}:${port}`)
    Env.getInstance().app.listen(port, () => {
        console.log(`listening on http://${host}:${port}`)
        Env.getInstance().logger.info(`listening on http://${host}:${port}`)
    })
})
