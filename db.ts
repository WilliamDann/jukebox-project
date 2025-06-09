import {Client}                 from 'pg'
import {readFileSync}           from 'fs';

// initalize the mysql database
export default function(): Promise<Client|null>
{
    return new Promise((resolve, reject) => {
        // read the script to create the DB
        const initScript = `
            -- table storing user accounts
            create table if not exists accounts (
                id           int          unique not null auto_increment,
                email        varchar(255) unique not null,
                displayName  varchar(255) not null,
                passwordHash varchar(255) not null,

                primary key (id)
            );

            -- table storing access tokens to our application
            --  this is not access tokens to spotify
            create table if not exists accessTokens (
                accessToken     varchar(255) unique not null,
                accountId       int not null,

                primary key(accessToken),
                foreign key(accountId) references accounts(id)
            );

            -- a user profile belongs to a user under an account who has connected their spotify
            create table if not exists profiles (
                id              int unique not null auto_increment,
                displayName     varchar(255) not null,
                accountId       int not null,
                active          boolean not null default false,

                -- spotify assigns an auth code to every connected account
                --  this is different than the token that performs actions.
                --  this code is never refreshed and is created when the account is linked
                spotAuthToken   varchar(255),      

                primary key(id),
                foreign key(accountId) references accounts(id)       
            );

            -- a spotify access token is what allows us to take actions on a user's behalf
            --  there are generated when we need then and they expire after some time
            create table if not exists spotifyAccessTokens (
                -- info returned by spotify
                access_token         varchar(255) not null,
                refresh_token        varchar(255) not null,
                expires_in           int not null,
                scope                varchar(255) not null,

                -- our info
                profileId           int not null,
                generatedAt         bigint not null,

                primary key(access_token),
                foreign key(profileId) references profiles(id)
            )`
    
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