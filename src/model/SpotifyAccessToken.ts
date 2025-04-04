import { escape } from "mysql";
import queryAsync from "../util/queryAsync";

export default class SpotifyAccessToken {
    accountId       !: number;

    access_token    !: string;
    refresh_token   !: string;

    expires_in      !: number;
    generated       !: number;

    // create in db
    async Create() {
        const query = `insert into 
            spotTokens(accountId, access_token, refresh_token, expires_in, \`generated\`)
            values(
                ${escape(this.accountId)},
                ${escape(this.access_token)},
                ${escape(this.refresh_token)},
                ${escape(this.expires_in)},
                ${escape(this.generated)}
            );`;

        // send query
        await queryAsync(query);
    }

    // get an access token from db
    static async Read(accessToken: string): Promise<SpotifyAccessToken|null> {
        const query = `select * from spotTokens where access_token=${escape(accessToken)}`;
        const data  = await queryAsync(query);

        if (!data || data.length == 0) {
            return null;
        }

        return Object.assign(new SpotifyAccessToken(), data[0]);
    }

    // get tokens for a user
    static async ReadAccount(accountId: number): Promise<SpotifyAccessToken[]> {
        const query = `select * from spotTokens where accountId=${escape(accountId)}`;
        const data  = await queryAsync(query);

        if (!data || data.length == 0) {
            return [];
        }

        // return data from server
        let tokens: SpotifyAccessToken[] = [];
        for (let token of data) {
            Object.assign(new SpotifyAccessToken(), token);
        }
        return tokens;
    }

    // delete from db
    async Delete() {
        const query = `delete from spotTokens where access_token=${escape(this.access_token)}`;
        await queryAsync(query);
    }
}