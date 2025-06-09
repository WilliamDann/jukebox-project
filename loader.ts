import { Client }       from "pg";
import db               from "./db";
import Env              from "./env";
import SpotifyClient    from "./integration/spotifyClient";
import logger           from "./logger";
import { readFileSync } from "fs"

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// retry a func until a condition is met
async function retryUntil(f: () => void, until: () => boolean, maxTries = 10, timeDelay = 1000): Promise<boolean> 
{
    let tries = 0;
    while (tries < maxTries) {
        await f();
        if (until()) {
            return true;
        }

        tries++
        await wait(timeDelay)
    }
    return false;
}

// load all app components
export default async function() {    
    // load logger
    Env.getInstance().logger = logger();
    
    // load DB
    Env.getInstance().logger.info("Starting DB Connection...")
    let retry = 10
    if (!await retryUntil(
        async () => {
            Env.getInstance().logger.info("trying to connect to DB...")  
            Env.getInstance().db = await db() as Client;
            // console.log(Env.getInstance().db)
        },
        (): boolean => {
            if (Env.getInstance().db == null) {
                Env.getInstance().logger.error("Failed to load DB.");
            }
            return Env.getInstance().db != null
        }
    , retry)) {
        Env.getInstance().logger.error("Failed to connect to DB")
        throw new Error(`Failed to load DB after ${retry} tries.`);
    }

    // db loaded
    Env.getInstance().logger.info("DB Connected");
        
    // load spotify
    Env.getInstance().logger.info("Starting spotify connection...")
    Env.getInstance().spotify = new SpotifyClient();
    Env.getInstance().spotify.config = JSON.parse(readFileSync('config.json').toString()).spotify;

    if (!Env.getInstance().spotify.config.client_id)
        Env.getInstance().logger.error("X Failed to load spotify");

    // loaded
    Env.getInstance().logger.info("Spotify Connected");
            
    // setup OK
    return true;
}
        