import { readFileSync } from "fs";
import winston from "winston";

// spotify config data
export default class SpotifyConfig {
    client_id     : string
    client_secret : string

    constructor(client_id: string, client_secret: string) {
        this.client_id     = client_id;
        this.client_secret = client_secret;
    }

    // load the config from a file
    static LoadFile(path: string): SpotifyConfig {
        // read config data
        const file = readFileSync(path, 'utf-8')
        const data = JSON.parse(file);

        // validate config data
        if (!data.spotify || !data.spotify.client_id || !data.spotify.client_secret) {
            throw new Error("Invalid spotify config data");
        }

        // create config object
        return new SpotifyConfig(data.spotify.client_id, data.spotify.client_secret)        
    }
}