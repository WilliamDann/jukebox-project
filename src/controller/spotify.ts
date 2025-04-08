import Env                  from "../env";
import AppError             from "../error/AppError";
import InvalidRequestError from "../error/InvalidRequestError";
import PermissionError      from "../error/PermissionError";
import Profile              from "../model/Profile";
import SpotifyAccessToken   from "../model/SpotifyAccessToken";
import { getAuthedAccount } from "./account";
import { getProfile }       from "./profile";
import querystring          from 'querystring'

export default function()
{
    const app = Env.getInstance().app;
    const db  = Env.getInstance().db;

    app.get('/search', async (req, res) => {
        res.render('suggest/search');
    });

    // route to begin song search flow
    app.get('/results', async (req, res) => {
        const search = req.query.search;
        if (!search) 
            throw new InvalidRequestError('invalid search query provided');

        // build request data
        const url = '/v1/search?'+querystring.encode({
            q: search as string,
            type: 'track'
        });


        // send request
        let data: any = await Env.getInstance().spotify.request({}, url, 'api.spotify.com', 'GET', null, true);
        if (!data)
        {
            Env.getInstance().logger.error(data);
            throw new AppError("Spotify Error", "Invalid data returned from search");
        }
        data = JSON.parse(data);

        res.render('suggest/results', { items: data.tracks.items })
    });

    // route to begin spotify account link flow
    app.get('/profile/link', async(req, res) => {
        const account = await getAuthedAccount(req);
        const profile = await getProfile(req);

        // if the user can preform the action
        if (account.id != profile.accountId)
            throw new PermissionError();

        // build request info
        const scope = 'user-read-playback-state user-modify-playback-state';
        const qs    = querystring.stringify({
            response_type: 'code',
            client_id: Env.getInstance().spotify.config.client_id,
            scope: scope,
            redirect_uri: 'http://127.0.0.1:8080/callback',
            state: `${account.id},${profile.id}`,
            show_dialog: true
        })

        // redirect to spotify 
        res.redirect('https://accounts.spotify.com/authorize?' + qs);
    });

    // route to handle spotify callback
    app.get('/callback', async (req, res) => {
        // get return data
        const code      = req.query.code as string;
        const state     = req.query.state as string;

        if (!code) 
            throw new AppError("Spotify Error", 'error: ' + req.query.error);

        // get profile info from state
        const accountId = state.split(',')[0];
        const profileId = state.split(',')[1];

        const profile = await Profile.read(profileId as any);
        if (profile == null) 
            throw new AppError("Spotify Error", 'Invalid profileId in state');


        // add auth code to profile
        profile.spotAuthToken = code;
        await profile.update();

        // request user access token
        const data = await Env.getInstance().spotify.request({
            code: profile.spotAuthToken,
            grant_type: 'authorization_code',
            redirect_uri: 'http://127.0.0.1:8080/callback',
        }, '/api/token', 'accounts.spotify.com', 'POST');

        // spot token data
        const token = Object.assign(new SpotifyAccessToken(), JSON.parse(data) as object);
        if (token.access_token == null) {
            return res.render('base/error', { error: "failed to complete spotify auth flow - no access token" });
        }

        // create computed data for token
        token.profileId   = profile.id;
        token.generatedAt = Date.now();

        // create the token on the sever
        await token.create();

        // render page
        res.render('page/home', { message: "Account linked!" })
    });
}