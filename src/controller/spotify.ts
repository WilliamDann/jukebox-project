import Env                from "../env";
import querystring        from 'querystring'
import Account            from "../model/Account";
import SpotifyAccessToken from "../model/SpotifyAccessToken";

export default function() {
    // link spotify account
    Env.getInstance().app.get('/account/link', async (req, res) => {
        // get current accoutn
        const account = await Account.Read(req.cookies.accountId as any)
        if (!account) {
            return res.render('base/error', { error: "invalid account info for link" });
        }

        // generate sa
        const scope = 'user-read-email user-modify-playback-state';
        const qs    = querystring.stringify({
            response_type: 'code',
            client_id: Env.getInstance().spotify.config.client_id,
            scope: scope,
            redirect_uri: 'http://127.0.0.1:8080/callback',
        })

        // redirect to spotify 
        res.redirect('https://accounts.spotify.com/authorize?' + qs);
    });

    // callback from spotify auth code
    Env.getInstance().app.get('/callback', async (req, res) => {
        const account = await Account.Read(req.cookies.accountId);
        const code    = req.query.code as string;

        if (account == null || code == null) {
            return res.render('base/error', { error: "Failed to complete spotify auth flow" })
        }

        // add auth code to user info
        account.spotAuthCode = code;
        await account.Update();

        // request user access token
        const data = await Env.getInstance().spotify.request({
            code: account.spotAuthCode,
            grant_type: 'authorization_code',
            redirect_uri: 'http://127.0.0.1:8080/callback',
        }, '/api/token', 'accounts.spotify.com', 'POST');


        // spot token data
        const token = Object.assign(new SpotifyAccessToken(), JSON.parse(data) as object);
        console.log(token.access_token)
        if (token.access_token == null) {
            return res.render('base/error', { error: "failed to complete spotify auth flow - no access token" });
        }

        token.accountId = account.id;
        token.generated = Date.now();

        // create the token on the sever
        await token.Create();

        res.render('page/home', { message: "Spotify auth code added" })
    });
}