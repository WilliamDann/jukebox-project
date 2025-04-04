import Env from "../env";
import Account from "../model/Account";
import Token from "../model/Token";
import requireFields from "../util/requireFields";

// token controller
export default function()
{
    /// Frontend Routes
    Env.getInstance().app.get('/signin', async (req, res) => {
        res.render('token/signin')
    });

    /// API Routes
    // handle user auth
    Env.getInstance().app.post('/api/auth', async (req, res) => {
        // ensure required fields are present
        const missing = requireFields(req.body, [ 'email', 'password' ])
        if (missing.length != 0) {
            res.status(400);
            res.send("You are missing " + JSON.stringify(missing) + " from the request body");
            return;
        }

        // find account by email
        let account = await Account.ReadEmail(req.body.email);

        // if no account exists, fail
        if (account == null) {
            res.status(400);
            res.send("Invalid sign in information")
            return;
        }

        // if password does not match, fail
        if (!await account.PasswordMatch(req.body.password)) {
            res.status(400);
            res.send("Invalid sign in information")
            return;
        }

        // create sign in token
        let token = new Token()
            .Generate()
            .AccountId(account.id)
        token.Create()

        // set user cookies for sign in
        res.cookie('accountId', token.accountId);
        res.cookie('token', token.token);

        // OK, send to user
        res.render('base/redirect', { redirect: '/account/read?id='+token.accountId })
    });
}