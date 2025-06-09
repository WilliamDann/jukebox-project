import express, { Application } from 'express'
import bodyParser               from 'body-parser';
import cookieParser             from 'cookie-parser';
import { log } from './util/log';

// init the express app
export default function(): Application {
    // create express app
    const app = express()

    // middleware

    // set ejs as the view engine
    app.set('view engine', 'ejs');
    
    // static file serving
    //  icons, css, js, etc.
    app.use(express.static('./public'))
    
    // so that express parses cookies correctly
    app.use(cookieParser())
    
    // so that express parses url encoded form data correctly
    app.use(bodyParser.urlencoded({ extended: true }))
    
    // http logging 
    app.use((req, res, next) => {
        log('info', `Request: route="${req.path}" query="${JSON.stringify(req.query)}" body="${JSON.stringify(req.body)}"`)
        next();
    });

    return app;
}