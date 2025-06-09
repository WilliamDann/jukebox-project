import mysql, { Connection }    from 'mysql';
import {Client}                 from 'pg'
import {readFileSync}           from 'fs';

// initalize the mysql database
export default function(): Promise<Client|null>
{
    return new Promise((resolve, reject) => {
        // read the script to create the DB
        const initScript = readFileSync('./sql/create.sql');
        if (!initScript)
        {
            console.error("! Could not load DB init script!")
        }
    
        // connect to local mysql database
        //  for development this is fine but when the app is released
        //  we will need a real db
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        // connect to the mysql db
        client.connect(err => {
            console.log(err)
            if (err) resolve(null)
            else {
                resolve(client)
            }
        });
        
        // attempt to run the init script
        if (initScript)
            client.query(initScript.toString(), (err, result) => {
                if (err)
                    console.error("! Failed init script: " + err);
                console.log("✔ db init script ran");
            });
    })
}