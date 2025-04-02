import app from './app';
import db  from './db';

// call init functions for the app
export default function() {
    app()
    db()
}