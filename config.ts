import {readFileSync} from 'fs';

// app config
export class Config {
    spotify !: SptoifyConfig
}

// spotify config
export class SptoifyConfig {
    // stored client info
    client_id     !: string
    client_secret !: string

    // access token info from spotify
    access_token  ?: SpotifyAccessToken
}

// spotify access token
export class SpotifyAccessToken {
    access_token !: string
    token_type   !: string
    expires_in   !: number // how long after generation the token expires
    generated    !: number // when we generated the token
}

export default function() : Config {
    // read 
    const config = new Config();

    // load config file
    try {
        const file   = readFileSync('config.json', 'utf-8')
        Object.assign(config, JSON.parse(file))
    } catch (e) {
        console.error("Could not load config.json. Are you missing the config.json file?")
        throw e;
    }

    // return config data
    return config;
}