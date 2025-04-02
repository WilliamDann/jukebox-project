import Env          from "../env";

import querystring  from 'querystring'
import http         from 'http'

import { SpotifyAccessToken, SptoifyConfig } from "../config";

async function requestAccessToken(config: SptoifyConfig): Promise<SpotifyAccessToken>
{
    return new Promise((resolve, reject) => {
        // create request body
        const bodyData = querystring.stringify({
            client_id: config.client_id,
            client_secret: config.client_secret
        });
    
        // create request info
        const postOpts = {
            host: 'accounts.spotify.com',
            post: 80,
            path: '/api/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    
        // create request and response handler
        var req = http.request(postOpts, res => {
            res.setEncoding('utf-8');
            res.on('data', chunk => {
                const data = JSON.parse(chunk);
                if (!data) {
                    reject(`invalid data from spotify: ${data}`);
                    return;
                }

                resolve(data)
            });
            res.on('error', e => {
                reject(e)
            });
        });

        // send the request
        console.log(bodyData)
        req.write(bodyData);
    })
}

// connect to spotify api
export default async function()
{
    const logger = Env.getInstance().logger;

    // get client info from config
    logger.info("starting spotify integration")
    const config = Env.getInstance().config;
    if (config && !config.spotify) {
        logger.error("failed to start spotify integration, no config data found.")
        throw new Error("No Spotify config info found on config object.")
    }

    // send access token request
    logger.info("requesting access token from spotify")
    try {
        const spotifyToken = await requestAccessToken(config.spotify);
        config.spotify.access_token = spotifyToken;
        logger.info(spotifyToken)
    } catch (e) {
        logger.error(`Spotify Access token request failed ${e}`);
        throw new Error(`Spotify Access token request failed ${e}`)
    }

    // OK
    console.log("✔ Spotify integration started")
    logger.info("Spotify access token recived");
}