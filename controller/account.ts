import Env           from "../env";
import requireFields from '../util/requireFields';
import Account       from '../model/Account';

// account controller
export default function() {

    // post route for user accounts
    Env.getInstance().app.post('/api/account', async (req, res) => {
        // check required fields
        const missing = requireFields(req.body, [ 'email', 'password', 'displayName' ])
        if (missing.length != 0) {
            res.status(500);
            res.send("You are missing " + missing + " from the request body");
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
    Env.getInstance().app.get('/api/account', async (req, res) => {
        const missing = requireFields(req.query, [ 'id' ])
        if (missing.length != 0) {
            res.status(500);
            res.send("You are missing " + missing + " from the request body");
            return;
        }
        
        // query account info from db
        const account = await Account.Get(req.query.id as any)
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
}