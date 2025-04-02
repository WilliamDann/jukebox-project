import express, { Application }    from 'express'
import bodyParser from 'body-parser';

// init the express app
export default function(): Application{
    // create express app
    const app = express()

    // middleware

    // static file serving
    //  icons, css, js, etc.
    app.use(express.static('./public'))

    // so that express parses url encoded form data correctly
    app.use(bodyParser.urlencoded({ extended: true }))

    return app;
}