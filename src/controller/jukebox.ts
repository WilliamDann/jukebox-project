import Env     from "../env";
import Account from "../model/Account";
import Jukebox from "../model/Jukebox";
import SpotifyAccessToken from "../model/SpotifyAccessToken";
import Token from "../model/Token";
import queryAsync from "../util/queryAsync";
import requireFields from "../util/requireFields";
import querystring from 'querystring';

export default function() 
{
    // spotify 
    Env.getInstance().app.get('/jukebox/link', async (req, res) => {
        // get current account
        const account = await Account.Read(req.cookies.accountId as any)
        if (!account) {
            return res.render('base/error', { error: "invalid account info for link" });
        }

        const jukebox = await Jukebox.Read(req.query.id as any);
        if (!jukebox) {
            return res.render('base/error', { error: "invalid jukebox id" });
        }

        // if the user can preform the action
        if (account.id != jukebox.ownerId) {
            res.render('base/error', { error: "You do not have permission for this action" })
            return;
        }

        // generate sa
        const scope = 'user-read-email user-modify-playback-state';
        const qs    = querystring.stringify({
            response_type: 'code',
            client_id: Env.getInstance().spotify.config.client_id,
            scope: scope,
            redirect_uri: 'http://127.0.0.1:8080/callback',
            state: `${account.id},${jukebox.id}`
        })

        // redirect to spotify 
        res.redirect('https://accounts.spotify.com/authorize?' + qs);
    });

    // callback from spotify auth code
    Env.getInstance().app.get('/callback', async (req, res) => {
        const code      = req.query.code as string;
        const state     = req.query.state as string;

        const jukeboxId = state.split(',')[1]

        const jukebox   = await Jukebox.Read(jukeboxId as any);

        if (jukebox == null || code == null) {
            Env.getInstance().logger.error("Fained to complete spotify auth flow")

            return res.render('base/error', { error: "Failed to complete spotify auth flow" })
        }

        // add auth code to user info
        jukebox.spotifyAuthCode = code;
        await jukebox.Update();

        // request user access token
        const data = await Env.getInstance().spotify.request({
            code: jukebox.spotifyAuthCode,
            grant_type: 'authorization_code',
            redirect_uri: 'http://127.0.0.1:8080/callback',
        }, '/api/token', 'accounts.spotify.com', 'POST');


        // spot token data
        const token = Object.assign(new SpotifyAccessToken(), JSON.parse(data) as object);
        if (token.access_token == null) {
            return res.render('base/error', { error: "failed to complete spotify auth flow - no access token" });
        }

        // create computed data for token
        token.jukeboxId = jukebox.id;
        token.generated = Date.now();

        // create the token on the sever
        await token.Create();

        res.render('page/home', { message: "Account linked!" })
    });

    // show all jukeboxes created by a user
    Env.getInstance().app.get('/jukebox/my', async (req, res) => {
        const accountId = req.cookies.accountId as any;
        const account   = await Account.Read(accountId);

        // if user is not signed in redirect to signin page
        if (!account) {
            return res.redirect('/signin');
        }

        let boxes = await Jukebox.ReadAccount(account.id)
        for (let box of boxes) {
            box = box.CleanObject();
        }

        res.render('jukebox/list', { jukeboxes: boxes });
    });

    // create jukebox
    Env.getInstance().app.get('/jukebox/create', async (req, res) => {
        const accountId = req.cookies.accountId as any;
        const account   = await Account.Read(accountId);

        // if user is not signed in redirect to signin page
        if (!account) {
            return res.redirect('/signin');
        }

        // render create page
        res.render('jukebox/create');
    });

    // read jukebox
    Env.getInstance().app.get('/jukebox/read', async (req, res) => {
        const id      = req.query.id as any;
        const jukebox = await Jukebox.Read(id);

        if (!jukebox) {
            return res.render('base/error', { error: 'Invalid jukebox id' });
        }

        res.render('jukebox/read', { jukebox: jukebox.CleanObject() })
    });

    // update jukebox
    Env.getInstance().app.get('/jukebox/update', async (req, res) => {
        const id      = req.query.id as any;
        const jukebox = await Jukebox.Read(id);

        if (!jukebox) {
            return res.render('base/error', { error: 'Invalid jukebox id' });
        }

        res.render('jukebox/update', { jukebox: jukebox.CleanObject() })
    })

    // delete jukebox
    Env.getInstance().app.get('/jukebox/delete', async (req, res) => {
        const id      = req.query.id as any;
        const jukebox = await Jukebox.Read(id);

        if (!jukebox) {
            return res.render('base/error', { error: 'Invalid jukebox id' });
        }

        res.render('jukebox/delete', { jukebox: jukebox.CleanObject() })
    })

    /// API ROUTES
    Env.getInstance().app.post('/api/jukebox/create', async (req, res) => {
        // check signed in user
        const accountId = req.cookies.accountId as any;
        const account   = await Account.Read(accountId);
        if (!account) {
            return res.render('base/error', { error: "Invalid user sign in" });
        }

        // check required fields
        const missing = requireFields(req.body, [ 'displayName' ])
        if (missing.length != 0) {
            res.status(400);
            res.send("You are missing " + JSON.stringify(missing) + " from the request body");
            return;
        }

        // create in db
        let jukebox = new Jukebox();
        jukebox.displayName = req.body.displayName;
        jukebox.ownerId     = account.id;
        await jukebox.Create();

        // redirect to read page
        const id = await queryAsync(`select last_insert_id() as data`)
        res.render('base/redirect', { redirect: '/jukebox/read?id='+id[0]['data'] })
    });

    // TODO
    Env.getInstance().app.post('/api/jukebox/update', async (req, res) => {
        res.render('base/error', { error: "not implemented" })
    });

    // TODO this is not the way to do this!!
    Env.getInstance().app.post('/api/jukebox/delete', async (req, res) => {
        let id    = req.body.id;
        const box = await Jukebox.Read(id as any)
        if (!box) {
            return res.render('base/error', { error: "failed" })
        }
        await box.Delete();

        res.redirect('/jukebox/my?id='+req.cookies.accountId)
    });
}