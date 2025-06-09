import {Client}                 from 'pg'
import {readFileSync}           from 'fs';

// initalize the mysql database
export default function(): Promise<Client|null>
{
    return new Promise((resolve, reject) => {
        // read the script to create the DB
        const initScript = `
        -- create the schema if it doesn't exist
        create schema if not exists jukeboxdb;

        -- switch to the schema (in PostgreSQL you set the search_path)
        set search_path to jukeboxdb;

        -- table storing user accounts
        create table if not exists accounts (
            id serial primary key,
            email varchar(255) unique not null,
            displayName varchar(255) not null,
            passwordHash varchar(255) not null
        );

        -- table storing access tokens to our application
        -- this is not access tokens to spotify
        create table if not exists accessTokens (
            accessToken varchar(255) primary key,
            accountId int not null references accounts(id)
        );

        -- a user profile belongs to a user under an account who has connected their spotify
        create table if not exists profiles (
            id serial primary key,
            displayName varchar(255) not null,
            accountId int not null references accounts(id),
            active boolean not null default false,
            spotAuthToken varchar(255)
        );

        -- a spotify access token is what allows us to take actions on a user's behalf
        -- they are generated when we need them and expire after some time
        create table if not exists spotifyAccessTokens (
            access_token varchar(255) primary key,
            refresh_token varchar(255) not null,
            expires_in int not null,
            scope varchar(255) not null,
            profileId int not null references profiles(id),
            generatedAt bigint not null
        );
        `
    
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