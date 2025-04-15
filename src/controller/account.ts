import { Request, Response }            from "express";
import Env                              from "../env";
import InvalidRequestError              from "../error/InvalidRequestError";
import Account                          from "../model/Account";
import requireFields                    from "../util/requireFields";
import AccessToken                      from "../model/AccessToken";
import PermissionError                  from "../error/PermissionError";
import AuthError                        from "../error/AuthError";

// get account from request query
export async function getAccount(req: Request): Promise<Account>
{
    const accountId = req.query.accountId as any;
    const account   = await Account.read(accountId);

    // if account was not read, fail
    if (!account)
        throw new InvalidRequestError('invalid accountId supplied');

    return account;
}

// get either the accoundId supplier or the currently authed account
export async function getAccountOrAuthedAccount(req: Request): Promise<Account|null>
{
    try {
        const account = await getAccount(req); 
        return account;
    } catch { }

    try {
        const authed = await getAuthedAccount(req);
        return authed;
    } catch { }

    return null;
}

// get the user that is currently signed in via their access token
export async function getAuthedAccount(req: Request): Promise<Account>
{
    const accessToken = await AccessToken.read(req.cookies.accessToken);
    if (!accessToken)
        throw new AuthError();

    const user = await Account.read(accessToken.accountId);
    if (!user)
        throw new AuthError();

    return user;
}

export default function() {
    const app = Env.getInstance().app;
    const db  = Env.getInstance().db;

    /// Frontend routes

    // create account route
    app.get('/account/create', (req, res) => {
        res.render('account/create');
    })

    //logout route
    app.get('/account/logout', (req, res) => {
        res.clearCookie('accessToken');
        return res.redirect('/auth')
    });

    // read account route
    app.get('/account/read', async (req, res) => {
        // get either the acccount if the id supplied or the signed in account
        const account = await getAccountOrAuthedAccount(req)

        // if neither exists prompt user to sign in
        if (!account) {
            return res.redirect('/auth')
        }

        // render account pgae
        res.render('account/read', { account: account.cleanObject() });
    });

    // render update page
    app.get('/account/update', async (req, res) => {
        const account = await getAccount(req);

        // render update page
        res.render('account/update', { account: account.cleanObject() });
    });

    // render delete page
    app.get('/account/delete', async (req, res) => {
        const account = await getAccount(req);
        
        res.redirect('/');
    });

    /// Backend routes

    // handle form submission from account create page
    app.post('/account/create', async (req, res) => {
        const missing = requireFields(req.body, [ 'email', 'displayName', 'password' ]);
        if (missing.length != 0)
            throw new InvalidRequestError(`missing ${JSON.stringify(missing)} from request body`);
    
        // create account object
        const account        = new Account();
        account.email        = req.body.email;
        account.displayName  = req.body.displayName;
        account.passwordHash = Account.hashPassword(req.body.password);

        // check if account already exists
        if (await Account.emailExists(account.email))
            throw new InvalidRequestError('email is alrady in use');

        // create in db
        await account.create();

        // show user signin page
        res.redirect('/auth');
    });

    // handle form submission from account update page
    app.post('/account/update', async (req, res) => {
        const missing = requireFields(req.body, [ 'id' ]);
        if (missing.length != 0)
            throw new InvalidRequestError(`missing ${JSON.stringify(missing)} from request body`);
    
        // get signed in user by auth user and check if the user can edit this data
        const authUser = await getAuthedAccount(req)
        if (authUser.id != req.body.id) {
            throw new PermissionError();
        }

        // create account object
        const account        = new Account();
        account.id           = req.body.id as any;
        account.email        = req.body.email;
        account.displayName  = req.body.displayName;

        // update in db
        await account.update();

        // show user updated data
        res.redirect('/account/read?id=' + account.id);
    });

    // handle form submission from account delete page
    app.post('/account/delete', async (req, res) => {
        const missing = requireFields(req.body, [ 'id' ]);
        if (missing.length != 0)
            throw new InvalidRequestError(`missing ${JSON.stringify(missing)} from request body`);
  
        // get signed in user by auth user and check if the user can edit this data
        const authUser = await getAuthedAccount(req)
        if (authUser.id != req.body.id) {
            throw new PermissionError();
        }

        // create account object
        const account = new Account()
        account.id = req.body.id as any;

        // delete account
        await account.delete();

        res.render('base/page', { message: "Account deleted." });
    })
}