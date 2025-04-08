import { escape, Query }    from "mysql"
import queryAsync           from "../util/queryAsync"
import sqlSetString         from "../util/sqlSetString"

export default class SpotifyAccessToken
{
    access_token    !: string
    refresh_token   !: string
    expires_in      !: string
    scope           !: string

    profileId       !: number
    generatedAt     !: number

    // get object from the db
    static async read(accessToken: string): Promise<SpotifyAccessToken|null> {
        const data = await queryAsync(`select * from spotifyAccessTokens where access_token=${escape(accessToken)}`);

        if (!data || data.length == 0)
            return null;
        return Object.assign(new SpotifyAccessToken(), data);
    }

    // get objects from the db where profileId is associated
    static async readProfile(profileId: number): Promise<SpotifyAccessToken[]>
    {
        // query data
        const data = await queryAsync(`select * from spotifyAccessTokens where access_token=${escape(profileId)}`);
        if (!data || data.length == 0)
            return [];

        // copy results to objects and return
        const arr: SpotifyAccessToken[] = [];
        for (let token of data)
            arr.push(Object.assign(new SpotifyAccessToken(), token))
        return arr;
    }

    // create object in the db
    async create(): Promise<Query>
    {
        const data = await queryAsync(`
            insert into
                spotifyAccessTokens(access_token, refresh_token, expires_in, scope, profileId, generatedAt)
                values(
                    ${escape(this.access_token)},
                    ${escape(this.refresh_token)},
                    ${escape(this.expires_in)},
                    ${escape(this.scope)},
                    ${escape(this.profileId)},
                    ${escape(this.generatedAt)}
                );
            `)
        return data;
    }

    // update object in the db
    async update(): Promise<Query>
    {
        const result = await queryAsync(`update spotifyAccessTokens ${sqlSetString(this)} where access_token=${escape(this.access_token)}`);
        return result;
    }

    // delete object in the db
    async delete(): Promise<Query>
    {
        const result = await queryAsync(`delete from spotifyAccessTokens where access_token=${escape(this.access_token)}`);
        return result;
    }
}