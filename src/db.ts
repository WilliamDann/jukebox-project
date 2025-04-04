import mysql, { Connection }    from 'mysql';
import {readFileSync}           from 'fs';

// initalize the mysql database
export default function(): Promise<Connection|null>
{
    return new Promise((resolve, reject) => {
        // read the script to create the DB
        const initScript = readFileSync('./sql/create.sql');
        if (!initScript)
        {
            console.error("! Could not load DB init script!")
        }
    
        const configFile = readFileSync('./config.json');
        const config     = JSON.parse(configFile.toString())
    
        // connect to local mysql database
        //  for development this is fine but when the app is released
        //  we will need a real db
        const connection = mysql.createConnection({
            host     : config.mysql.host,
            port     : config.mysql.port,
            database : 'jukeboxProject',
            user     : config.mysql.user,
            password : config.mysql.password,
            multipleStatements: true
        });
        
        // connect to the mysql db
        connection.connect(err => {
            console.log(err)
            if (err) resolve(null)
            else {
                resolve(connection)
            }
        });
        
        // attempt to run the init script
        if (initScript)
            connection.query(initScript.toString(), (err, result, fields) => {
                if (err)
                    console.error("! Failed init script: " + err);
                console.log("✔ db init script ran");
            });
    })
}