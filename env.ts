import { Application }  from 'express'
import { Connection  }  from 'mysql'
import app              from './app';
import db               from './db';
import { Logger }       from 'winston';
import logger           from './logger';
import config, { Config } from './config';

// singelton instance for applicaiton enviroment
//  this contains the express app, logger, etc.
//  will always return the same instance of Env
//  example usage:
//   Env.getInstance().app.listen('api/route', (request, response) => { ... })
export default class Env {
    private static instance: Env

    // express.js application
    public app: Application;
    // mysql database connection

    // mysql database connection
    public db : Connection;

    // logger instance
    public logger: Logger

    // integration config data
    public config: Config

    // inaccessable outside the class
    private constructor() {
        this.logger = logger();
        this.app    = app();
        this.db     = db();
        this.config = config();
    }

    // always returns the same instance of Env
    static getInstance() {
        if (!this.instance) {
            this.instance = new Env();
        }
        return this.instance
    }
}