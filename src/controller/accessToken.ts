import Env                  from "../env";
import AuthError            from "../error/AuthError";
import InvalidRequestError  from "../error/InvalidRequestError";
import AccessToken          from "../model/AccessToken";
import Account              from "../model/Account";
import requireFields        from "../util/requireFields";

export default function()
{
    const app = Env.getInstance().app;
    const db  = Env.getInstance().db;

    // sign in route
    app.get('/auth', async (req, res) => {
        res.render('token/create');
    });

    // route to generate access tokens
    app.post('/auth', async (req, res) => {
        const missing = requireFields(req.body, [ 'email', 'password' ]);
        if (missing.length != 0)
            throw new InvalidRequestError(`missing ${JSON.stringify(missing)} from request body`);

        // get account info from db by email
        const user = await Account.readEmail(req.body.email);
        if (!user) 
            throw new AuthError();

        // check if the user's password is a match
        if (!user.checkPassword(req.body.password))
            throw new AuthError();

        // generate a new token
        let token = new AccessToken();
        token.accessToken = AccessToken.generateToken();
        token.accountId   = user.id;

        await token.create();

        // set cookie on user device
        res.cookie('accessToken', token.accessToken);

        // show user their account page
        res.redirect('/account/read?id='+user.id);
    });
}