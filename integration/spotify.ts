import Env          from "../env";

import querystring  from 'querystring'
import https         from 'https'

import { SpotifyAccessToken, SptoifyConfig } from "../config";

async function requestAccessToken(config: SptoifyConfig): Promise<SpotifyAccessToken>
{
    return new Promise((resolve, reject) => {
        // form data
        let qs = querystring.stringify({
            'grant_type': 'client_credentials',
            'client_id': 'ca8578e86b9649159d0ca9aa5634c959',
            'client_secret': 'f41118a8cc684bad86668f26053bda65'
        })

        // build request options
        const options = {
            "method": "POST",
            "hostname": "accounts.spotify.com",
            "port": null,
            "path": "/api/token",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": Buffer.byteLength(qs)
            }
        };
    
        // build request
        const req = https.request(options, function (res) {
            const chunks: any[] = [];
          
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
          
            res.on("end", function () {
                const body = Buffer.concat(chunks);
                const obj  = JSON.parse(body.toString())

                const token = new SpotifyAccessToken();
                Object.assign(token, obj)

                if (res.statusCode != 200) {
                    reject(token)
                    return
                }
                resolve(token)
            });
    
            res.on("error", reject)
        });
    
        // send request
        Env.getInstance().logger.info(qs)
        req.write(qs);
        req.end();
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
        logger.info(JSON.stringify(spotifyToken))
    } catch (e) {
        throw new Error(`Spotify Access token request failed ${JSON.stringify(e)}`);
    }

    // OK
    console.log("✔ Spotify integration started")
    logger.info("Spotify access token recived");
    logger.info(config.spotify.access_token.access_token);
}