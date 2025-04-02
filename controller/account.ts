import Env              from "../env";
import requireFields    from '../util/requireFields';
import Account          from '../model/Account';
import Token            from "../model/Token";

// account controller
export default function() {
    /// Frontend routes

    // create account page
    Env.getInstance().app.get('/account/create', async (req, res) => {
        res.render('account/create')
    })

    // view account page
    Env.getInstance().app.get('/account/read', async (req, res) => {
        // determine account id
        let accountId = req.query.id;
        if (!accountId) {
            accountId = req.cookies.accountId;
        } 
        if (!accountId) {
            res.render('base/error', { error: "Invalid account id : " + accountId });
            return;
        }

        // find the account
        let account = await Account.Read(accountId as any);
        if (!account) {
            res.render('base/error', { error: "Account not found" });
            return;
        }

        // render the read page
        res.render('account/read', { account: account.CleanObject() })
    })

    // udapte account page
    Env.getInstance().app.get('/account/update', async (req, res) => {
        // determine account id
        let accountId = req.query.id;
        if (!accountId) {
            accountId = req.cookies.accountId;
        } 
        if (!accountId) {
            res.render('base/error', { error: "Invalid account id : " + accountId });
            return;
        }

        // find the account
        let account = await Account.Read(accountId as any);
        if (!account) {
            res.render('base/error', { error: "Account not found" });
            return;
        }

        // render the read page
        res.render('account/update', { account: account.CleanObject() })
    })

    // delete account page
    Env.getInstance().app.get('/account/delete', async (req, res) => {
        // determine account id
        let accountId = req.query.id;
        if (!accountId) {
            accountId = req.cookies.accountId;
        } 
        if (!accountId) {
            res.render('base/error', { error: "Invalid account id : " + accountId });
            return;
        }

        // find the account
        let account = await Account.Read(accountId as any);
        if (!account) {
            res.render('base/error', { error: "Account not found" });
            return;
        }

        // render the read page
        res.render('account/delete', { account: account.CleanObject() })
    })

    /// API ROUTES
    // post route for user accounts
    Env.getInstance().app.post('/api/account/create', async (req, res) => {
        // check required fields
        const missing = requireFields(req.body, [ 'email', 'password', 'displayName' ])
        if (missing.length != 0) {
            res.status(400);
            res.send("You are missing " + JSON.stringify(missing) + " from the request body");
            return;
        }

        // create account object
        let account = new Account()
            .Email(req.body.email)
            .Password(req.body.password)
            .DisplayName(req.body.displayName)
        
        // if we already have an account for this user, fail
        if (await account.Exists()) {
            res.status(400);
            res.send("Email is already in use.")
            return;
        }

        // create the user in the db
        account.Create();

        // OK
        res.sendStatus(200);
    });

    // get route for user accounts
    Env.getInstance().app.get('/api/account/read', async (req, res) => {
        const missing = requireFields(req.query, [ 'id' ])
        if (missing.length != 0) {
            res.status(400);
            res.send("You are missing " + JSON.stringify(missing) + " from the request body");
            return;
        }
        
        // query account info from db
        const account = await Account.Read(req.query.id as any)
        if (account == null) {
            res.sendStatus(404);
            return;
        }

        // don't send password hash in request
        const data = Object.assign({}, account) as any;
        data.passwordhash = undefined;

        // OK
        res.json(data);
    });

    // update route for user accounts
    Env.getInstance().app.post('/api/account/update', async (req, res) => {
        // check user token
        const missing = requireFields(req.cookies, [ 'accountId', 'token' ])
        if (missing.length != 0) {
            res.status(400);
            res.send("You are missing " + JSON.stringify(missing) + " from the request body");
            return;
        }

        // check if the token exists
        const token = await Token.Read(req.cookies.token);
        if (token == null) {
            res.sendStatus(403); // forbidden
            return;
        }

        // check if the token is for the user trying to use it
        if (!token.Check(req.cookies.accountId)) {
            res.sendStatus(403); // forbidden
            return;
        }

        // get the user to update
        const account = await Account.Read(req.cookies.accountId);
        if (account == null) {
            res.sendStatus(404); // not found
            return;
        }

        // set new values
        if (req.body.displayName)
            account.DisplayName(req.body.displayName);
        // if (req.body.password)
        //     account.Password(req.body.password);
        if (req.body.email)
            account.Email(req.body.email)

        // update in db
        account.Update();

        // OK
        res.sendStatus(200);
    });

    // delete route for user accounts
    Env.getInstance().app.post('/api/account/delete', async (req, res) => {
        // check user token
        const missing = requireFields(req.cookies, [ 'accountId', 'token' ])
        if (missing.length != 0) {
            res.status(400);
            res.send("You are missing " + JSON.stringify(missing) + " from the request body");
            return;
        }

        // check if the token exists
        const token = await Token.Read(req.cookies.token);
        if (token == null) {
            res.sendStatus(403); // forbidden
            return;
        }

        // check if the token is for the user trying to use it
        if (!token.Check(req.cookies.accountId)) {
            res.sendStatus(403); // forbidden
            return;
        }

        // get the user to update
        const account = await Account.Read(req.cookies.accountId);
        if (account == null) {
            res.sendStatus(404); // not found
            return;
        }

        // delete the account
        account.Delete();

        // remove cookies for deleted account
        res.cookie('accountId', undefined);
        res.cookie('token', undefined);
        
        // OK
        res.sendStatus(200);
    });
}