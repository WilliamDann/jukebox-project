import { Request }                                  from "express";
import Env                                          from "../env";
import Profile                                      from "../model/Profile";
import InvalidRequestError                          from "../error/InvalidRequestError";
import account, { getAccount, getAuthedAccount }    from "./account";
import PermissionError                              from "../error/PermissionError";
import requireFields                                from "../util/requireFields";
import AppError from "../error/AppError";

// get the current profile from request data
export async function getProfile(req: Request): Promise<Profile>
{
    let id = req.query.profileId as any;
    if (!id) {
        id = req.body.profileId;
    }
    const profile = await Profile.read(id);

    if (!profile) 
        throw new InvalidRequestError('profile id does not reference a profile object');

    return profile;
}

export default function()
{
    const app = Env.getInstance().app;
    const db  = Env.getInstance().db;

    // list all the profiles that exist under a given account id
    app.get('/profile/my', async(req, res) => {
        const account  = await getAuthedAccount(req);
        const profiles = await Profile.readAccount(account.id);
        
        res.render('profile/list', { account: account.cleanObject(), profiles: profiles.map(x => x.cleanObject()) });
    });
    
    // set a given profile to active
    app.get('/profile/setActive', async (req, res) => {
        const account = await getAuthedAccount(req);
        const profile = await getProfile(req);

        if (profile.accountId != account.id)
            throw new PermissionError();

        if (!profile.spotAuthToken)
            throw new AppError("Connection Error", "To set your profile to active you first have to connect the account.")

        // deactivate others
        for (let prof of await Profile.readAccount(account.id)) {
            prof.active = false;
            prof.update();
        }

        // activate given account
        profile.active = true;
        profile.update();

        // Show user profile list
        res.redirect('/profile/my');
    });

    // set a given profile to inactive
    app.get('/profile/setInactive', async (req, res) => {
        const account = await getAuthedAccount(req);
        const profile = await getProfile(req);

        if (profile.accountId != account.id)
            throw new PermissionError();

        // set profile ot inactive
        profile.active = false;
        profile.update();

        // show user profile list
        res.redirect('/profile/my');
    });

    // read page for profile data
    app.get('/profile/read', async (req, res) => {
        const profile = await getProfile(req);

        res.render('profile/read', { profile: profile.cleanObject() });
    });

    // create page for profile data
    app.get('/profile/create', async (req, res) => {
        const account  = await getAccount(req);
        res.render('profile/create', { account: account.cleanObject() });
    })

    // update page for profile data
    app.get('/profile/update', async (req, res) => {
        const profile = await getProfile(req);
        res.render('profile/update', { profile: profile.cleanObject() });
    });

    // delete page for profile data
    app.get('/profile/delete', async (req, res) => {
        const profile = await getProfile(req);
        res.render('profile/delete', { profile: profile.cleanObject() });
    });

    /// API routes

    // route to handle create profile form
    app.post('/profile/create', async (req, res) => {
        const account = await getAuthedAccount(req);
        const missing = requireFields( req.body,  [ 'displayName', 'accountId' ] )

        // make sure we have all the info we need
        if (missing.length != 0)
            throw new InvalidRequestError(`${JSON.stringify(missing)} missing from request body`);
        // make sure the authed user has permssion to preform action
        if (account.id != req.body.accountId)
            throw new PermissionError();
        
        // create object in DB
        const profile = new Profile();
        profile.accountId   = req.body.accountId;
        profile.displayName = req.body.displayName;
        profile.active      = false;
        
        await profile.create();

        // show user the list of their own profiles
        res.redirect('/profile/my');
    });

    // route to handle update profile form
    app.post('/profile/update', async (req, res) => {
        const account = await getAuthedAccount(req);
        const profile = await getProfile(req);

        // check permissions
        if (account.id != profile.accountId)
            throw new PermissionError();

        // copy changed data
        for (let key of Object.keys(profile))
            if (req.body[key])
                (profile as any)[key] = req.body[key];

        // update
        await profile.update();

        // show user new profile info
        res.redirect('/profile/read?profileId=' + profile.id);
    });

    // route to handle delete profile form
    app.post('/profile/delete', async (req, res) => {
        const account = await getAuthedAccount(req);
        const profile = await getProfile(req);

        // check permissions
        if (account.id != profile.accountId)
            throw new PermissionError();

        // delete the account
        await profile.delete();
    
        // show user list of profiles
        res.redirect('/profile/my');
    });
}