import mysql, { Connection }    from 'mysql';
import {readFileSync}           from 'fs';

// initalize the mysql database
export default function(): Connection
{
    // read the script to create the DB
    const initScript = readFileSync('./sql/create.sql');
    if (!initScript)
    {
        console.error("! Could not load DB init script!")
    }

    // connect to local mysql database
    //  for development this is fine but when the app is released
    //  we will need a real db
    const connection = mysql.createConnection({
        host     : 'localhost',
        port     : 3306,
        database : 'chessws',
        user     : 'root',
        password : 'root',
        multipleStatements: true
    });
    
    // connect to the mysql db
    connection.connect(err => {
        if (err)
            console.error("! Could not connect to DB: " + err);
        else
            console.log("✔ db connected");
    });
    
    // attempt to run the init script
    if (initScript)
        connection.query(initScript.toString(), (err, result, fields) => {
            if (err)
                console.error("! Failed init script: " + err);
            console.log("✔ db init script ran");
        });

    return connection;
}