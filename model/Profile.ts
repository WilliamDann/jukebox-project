import { escape, Query }    from "mysql"
import queryAsync           from "../util/queryAsync"
import sqlSetString         from "../util/sqlSetString"
import SpotifyAccessToken   from "./SpotifyAccessToken"

export default class Profile
{
    id              !: number
    displayname     !: string
    accountid       !: number
    active          !: boolean
    spotauthtoken   !: string

    // get a profile by it's id
    static async read(id: number): Promise<Profile|null>
    {
        const results = await queryAsync(`select * from profiles where id=${escape(id)}`);
        if (!results || results.length == 0)
            return null;

        return Object.assign(new Profile(), results[0]);
    }

    // get profiles associated with an account
    static async readAccount(accountId: number): Promise<Profile[]>
    {
        const results = await queryAsync(`select * from profiles where accountId=${escape(accountId)}`);
        if (!results || results.length == 0)
            return [];

        // return results as Profile object
        const arr : Profile[] = [];
        for (let result of results)
            arr.push(Object.assign(new Profile(), result));
        return arr;
    }

    // get the currently active profile on an account
    static async readActiveProfile(accountId: number): Promise<Profile|null>
    {
        const results = await queryAsync(`select * from profiles where accountId=${escape(accountId)} and active=true`);
        if (!results || results.length == 0)
            return null;

        return Object.assign(new Profile(), results[0]);
    }

    async create(): Promise<Query>
    {
        const results = await queryAsync(`
            insert into
                profiles(displayName, accountId, active)
                values(${escape(this.displayname)}, ${escape(this.accountid)}, ${this.active})
            `)
        return results;
    }

    async update(): Promise<Query>
    {
        const result = await queryAsync(`update profiles ${sqlSetString(this)} where id=${escape(this.id)}`);
        return result;
    }

    async delete(): Promise<Query>
    {
        // remove spotify access tokens associated with this profile
        for (let token of await SpotifyAccessToken.readProfile(this.id))
            await token.delete();

        const result = await queryAsync(`delete from profiles where id=${escape(this.id)}`);
        return result;
    }

    cleanObject() {
        const copy = Object.assign({}, this) as any;
        if (copy.spotAuthToken) {
            copy.spotAuthToken = true;
        } else {
            copy.spotAuthToken = false;
        }
        return copy;
    }
}