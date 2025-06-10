import SpotifyAccessToken from "../model/SpotifyAccessToken";
import { log }            from "../util/log";
import SpotifyConfig      from "./spotifyConfig";
import { SpotifyRequest } from './spotifyRequest';

// for making requests to spotify easily
export default class SpotifyClient
{
    config !: SpotifyConfig
    token  !: SpotifyAccessToken

    // get the current token for the client
    async fetchToken(): Promise<SpotifyAccessToken> 
    {
        const data = JSON.parse(await new SpotifyRequest()
            .AuthMode('basic')
            .Hostname('accounts.spotify.com')
            .Endpoint('/api/token')
            .Method('POST')
            .FormData({
                grant_type    : "client_credentials",
                client_id     : this.config.client_id,
                client_secret : this.config.client_secret
            })
            .Request());

        log('info', 'set client token: ' + data.access_token)

        this.token = Object.assign(new SpotifyAccessToken(), data);
        return this.token;
    }

    // refresh the token for this client
    async refreshToken(): Promise<SpotifyAccessToken> 
    {
        const data = JSON.parse(await new SpotifyRequest()
            .AuthMode('basic')
            .Hostname('accounts.spotify.com')
            .Endpoint('/api/token')
            .Method('POST')
            .FormData({
                grant_type    : "refresh_token",
                client_id     : this.config.client_id,
                refresh_token : this.token.refresh_token
            })
            .Request());

        log('info', 'set client token: ' + data.access_token)

        this.token = Object.assign(new SpotifyAccessToken(), data);
        return this.token;
    }

    // get a valid access token to use for requests
    //  this is the client_credentials token (the first one)
    async currentToken(): Promise<SpotifyAccessToken>
    {
        // if we have no token, get one
        if (!this.token)
            return await this.fetchToken();

        // if the token we have is expired, get a new one via refresh
        if (this.token.expired())
            return await this.refreshToken();

        // else use the current token
        return this.token;
    }
}