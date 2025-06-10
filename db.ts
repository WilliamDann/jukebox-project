import {Client}                 from 'pg'

// initalize the mysql database
export default function(): Promise<Client|null>
{
    return new Promise((resolve, reject) => {
        let client: Client;
        if (process.env.DATABASE_URL) {
            client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });
        } else {
            client = new Client({
                connectionString: "postgresql://postgres:root@localhost:5432/postgres",
                ssl: false
            });
        }

        // select correct db
        client.query('set search_path to jukeboxdb;')
        
        // connect to the mysql db
        client.connect(err => {
            console.log(err)
            if (err) resolve(null)
            else {
                resolve(client)
            }
        });
    })
}