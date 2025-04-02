import Env         from "./env";
import controllers from './controller/all'
import errors from "./errors";

// init 
Env.getInstance();

// register routes
controllers()

// use our custom error handling middleware
//  for some reason this has to be used after controllers are imported
//  not really sure why this is, but it will break if it's before!
Env.getInstance().app.use(errors)

// start app
Env.getInstance().logger.info("Starting server on http://localhost:8080")
Env.getInstance().app.listen(8080, 'localhost', () => {
    console.log("listening on http://localhost:8080")
    Env.getInstance().logger.info("listening on http://localhost:8080")
})
