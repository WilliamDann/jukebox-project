import querystring   from 'querystring';
import https         from 'https';
import Env           from '../env';
import SpotifyClient from './spotifyClient';
import { log } from '../util/log';

export const SPOTIFY_ACCOUNTS_HOSTNAME = 'accounts.spotify.com'
export const SPOTIFY_API_HOSTNAME      = 'api.spotify.com'

// data class for storing spotify request data
export class SpotifyRequest
{
    formData !: any;
    endpoint !: string;
    hostname !: "accounts.spotify.com"|"api.spotify.com";
    method   !: "POST"|"GET"|"PUT"|"DELETE";
    port     !: number|null;

    authMode !: "basic"|"token"|"user";
    token    ?: string;

    // init defaults
    constructor()
    {
        this.formData = {};
        this.hostname = SPOTIFY_API_HOSTNAME;
        this.method   = 'POST';
        this.port     = null;
        this.authMode = "token";
    }

    // method chaning params

    FormData(data: any)
    {
        this.formData = data;
        return this;
    }

    Endpoint(endpoint: string)
    {
        this.endpoint = endpoint;
        return this;
    }

    Hostname(hostname: "accounts.spotify.com"|"api.spotify.com")
    {
        this.hostname = hostname;
        return this;
    }

    Method(method: "POST"|"GET"|"PUT"|"DELETE")
    {
        this.method = method;
        return this;
    }

    Port(port: number|null = null)
    {
        this.port = port;
        return this;
    }

    AuthMode(mode: "basic"|"token"|"user")
    {
        this.authMode = mode;
        return this;
    }

    Token(token: string)
    {
        this.token = token
        return this;
    }

    // request body
    Payload()
    {
        return querystring.stringify(this.formData);
    }

    // get request headers
    async Headers(): Promise<any>
    {
        const spotify  = Env.getInstance().spotify as SpotifyClient;
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(this.Payload()),
            "Authorization": ""
        }

        // if we're supplying the our client auth, this is the mode. This maily for generating a token
        if (this.authMode == 'basic')
            headers.Authorization = `Basic ${(Buffer.from(spotify.config.client_id + ':' + spotify.config.client_secret).toString('base64'))}`;
        // if we're supplying a token after basic auth, this is the mode. This is most common
        else if (this.authMode == 'token')
            headers.Authorization = `Bearer ${(await spotify.currentToken()).access_token}`
        // if we're doing something on behalf of a user, this is the mode. This is when we're doing things on an account
        else
            headers.Authorization = `Bearer ${this.token}`;

        return headers;
    }

    // send a request
    Request(): Promise<string>
    {
        return new Promise(async (resolve, reject) => {
            // build request
            const opts = {
                "method"   : this.method,
                "hostname" : this.hostname,
                "port"     : this.port,
                "path"     : this.endpoint,
                "headers"  : await this.Headers()
            };
    
            // define callbacks
            const req = https.request(opts, function (res) {
                const chunks: any[] = [];
              
                res.on("data", function (chunk) {
                    log('info', 'Spotify Response: Chunk recieved')
                    chunks.push(chunk);
                });
              
                res.on("end", function () {
                    log('info', 'Spotify Response: Message Complete')
                    log('info', 'Spotify Response:' + Buffer.concat(chunks).toString())
                    resolve(Buffer.concat(chunks).toString())
                });
        
                res.on("error", e => { 
                    console.error("Spotify request failed: " + e)
                    log('error', e)
                    reject(e) 
                })
            });

            log('info', this.toString())

            // send request
            req.write(this.Payload());
            req.end();
        })
    }

    toString(): string
    {
        return `Spotify Request: hostname:${this.hostname} endpoint: ${this.endpoint} method: ${this.method} authMode: ${this.authMode}`
    }
}