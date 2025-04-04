import { Connection } from "mysql";
import app from "./app";
import db from "./db";
import Env from "./env";
import SpotifyIntegration from "./integration/spotify";
import logger from "./logger";

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
            Env.getInstance().db = await db() as Connection;
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
    let spot = new SpotifyIntegration();
    Env.getInstance().spotify = spot;
    
    if (!await retryUntil(
        async () => {
            Env.getInstance().logger.info("trying to connect to spotify...")  
            Env.getInstance().spotify.init()
        },
        (): boolean => {
            if (Env.getInstance().db == null) {
                Env.getInstance().logger.error("Failed to load spotify access token, retrying...");
            }
            return Env.getInstance().spotify.token != null
        }
    , retry)) {
        Env.getInstance().logger.error("Failed to get spotify access token")
        throw new Error(`Failed to load spotify ${retry} tries.`);
    }

    // loaded
    Env.getInstance().logger.info("Spotify Connected");
            
    // setup OK
    return true;
}
        