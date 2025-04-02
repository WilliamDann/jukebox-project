import Env         from "./env";
import controllers from './controller/all'

// register routes
controllers()

// start app
Env.getInstance().logger.info("Starting server on http://localhost:8080")
Env.getInstance().app.listen(8080, 'localhost', () => {
    console.log("listening on http://localhost:8080")
    Env.getInstance().logger.info("listening on http://localhost:8080")
})