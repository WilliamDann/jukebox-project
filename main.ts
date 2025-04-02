import Env         from "./env";
import controllers from './controller/all'

// register routes
controllers()

// start app
Env.getInstance().app.listen(8080, 'localhost', () => console.log("listening on http://localhost:8080"))