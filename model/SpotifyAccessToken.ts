import { escapeLiteral }    from "pg"
import queryAsync           from "../util/queryAsync"
import sqlSetString from "../util/sqlSetString"
import { escape } from "mysql"

export default class SpotifyAccessToken
{
    access_token    !: string
    refresh_token   !: string
    expires_in      !: string
    scope           !: string

    profileid       !: number
    generatedat     !: number

    // get object from the db
    static async read(accessToken: string): Promise<SpotifyAccessToken|null> {
        const data = await queryAsync(`select * from spotifyAccessTokens where access_token=${escapeLiteral(accessToken)}`);

        if (!data || data.length == 0)
            return null;
        return Object.assign(new SpotifyAccessToken(), data);
    }

    // get objects from the db where profileId is associated
    static async readProfile(profileId: number): Promise<SpotifyAccessToken[]>
    {
        // query data
        const data = await queryAsync(`select * from spotifyAccessTokens where profileId=${escapeLiteral(''+profileId)} order by generatedAt asc;`);
        if (!data || data.length == 0)
            return [];

        // copy results to objects and return
        const arr: SpotifyAccessToken[] = [];
        for (let token of data)
            arr.push(Object.assign(new SpotifyAccessToken(), token))
        return arr;
    }

    // if a given token is expired
    expired(): boolean {
        const expires_in = parseInt(this.expires_in);
        return (this.generatedat + expires_in*1000) <= Date.now()
    }

    // create object in the db
    async create(): Promise<any>
    {
        console.log(this.expires_in)
        const data = await queryAsync(`
            insert into
                spotifyAccessTokens(access_token, refresh_token, expires_in, scope, profileId, generatedAt)
                values(
                    ${escape(this.access_token)},
                    ${escape(this.refresh_token)},
                    ${escape(this.expires_in)},
                    ${escape(this.scope)},
                    ${escape(''+this.profileid)},
                    ${escape(''+this.generatedat)}
                );
            `)
        return data;
    }

    // update object in the db
    async update(): Promise<any>
    {
        const result = await queryAsync(`update spotifyAccessTokens ${sqlSetString(this)} where access_token=${escapeLiteral(this.access_token)}`);
        return result;
    }

    // delete object in the db
    async delete(): Promise<any>
    {
        const result = await queryAsync(`delete from spotifyAccessTokens where access_token=${escapeLiteral(this.access_token)}`);
        return result;
    }
}