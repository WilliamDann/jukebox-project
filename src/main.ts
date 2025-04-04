import Env         from "./env";
import controllers from './controller/all'
import errors      from "./errors";

const host = '0.0.0.0'
const port = 8080

// init 
Env.getInstance();

// register routes
controllers()

// use our custom error handling middleware
//  for some reason this has to be used after controllers are imported
//  not really sure why this is, but it will break if it's before!
Env.getInstance().app.use(errors)

// start spotify integration
Env.getInstance().spotify.init();

// start app
Env.getInstance().logger.info("Starting server on http://localhost:8080")
Env.getInstance().app.listen(port, host, () => {
    console.log(`listening on http://${host}:${port}`)
    Env.getInstance().logger.info(`listening on http://${host}:${port}`)
})