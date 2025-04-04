import SpotifyConfig                    from "./spotifyConfig";
import SpotifyToken                     from "./spotifyToken";
import querystring                      from 'querystring';
import https                            from 'https'
import {writeFileSync, readFileSync}    from 'fs'

// class to handle spotify requests
export default class SpotifyIntegration {
    config : SpotifyConfig;
    token ?: SpotifyToken;

    constructor() {
        this.config = SpotifyConfig.LoadFile('config.json');
    }

    // if the integration has been loaded correctly
    loaded(): boolean {
        return this.token != null;
    }

    // make a request to spotify
    //  returns string data from request
    //  this could be improved a lot! A library could do this, probably
    request(fromdata: any, endpoint: string, hostname: string, method: string = "POST", port: number|null = null): Promise<string> {
        return new Promise((resolve, reject) => {
            // form data
            const qs      = querystring.stringify(fromdata);
            const options = {
                "method": method,
                "hostname": hostname,
                "port": port,
                "path": endpoint,
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
                    resolve(Buffer.concat(chunks).toString())
                });
        
                res.on("error", e => { 
                    console.error("Spotify request failed: " + e)
                    reject(e) 
                })
            });

            
            // send request
            req.write(qs);
            req.end();
        });
    }

    // save a token to the file system
    saveToken(path: string) {
        if (!this.token) return;

        writeFileSync(path, JSON.stringify(this.token))
    }

    // load a spotify token from  a file
    loadToken(path: string): SpotifyToken|null {
        try {
            let data = readFileSync(path, 'utf-8');
            return JSON.parse(data)
        } catch (e) {
            return null;
        }
    }

    // get spotify access token from spotify
    async fetchToken(): Promise<SpotifyToken> {
        // create request body
        const requestObj      = Object.assign({}, this.config) as any;
        requestObj.grant_type = 'client_credentials';

        // request token from spotify
        const data = await this.request(requestObj, '/api/token', 'accounts.spotify.com', 'POST')
        const obj  = JSON.parse(data);

        // add time generated
        obj.generated = Date.now();
        
        // create token object
        const token = new SpotifyToken();
        Object.assign(token, obj)

        if (token.access_token == undefined) {
            console.error("!! Failed to load spotify access token")
        } else {
            console.log("✔ Spotify integration started")
        }

        // OK
        return token;
    }

    // get the spotify token
    async init() {
        let token = this.loadToken('spot.json')

        // if token exists and has not expired use the token
        if (token && (token.generated + token.expires_in*1000) > Date.now()) {

            console.log('using stored spotify token')
            this.token = token;
            return;
        }

        // generate a new access token
        this.token = await this.fetchToken();
        this.saveToken('spot.json');
    }
}