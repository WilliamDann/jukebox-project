import {escape}     from 'mysql'
import queryAsync   from "../util/queryAsync"
import sqlSetString from '../util/sqlSetString'
import SpotifyAccessToken from './SpotifyAccessToken'

export default class Jukebox {
    id              !: number
    ownerId         !: number
    displayName     !: string
    spotifyAuthCode !: string

    async Create() {
        const query = `insert into 
            jukeboxes(ownerId, displayName, spotifyAuthCode)
            values(${escape(this.ownerId)}, ${escape(this.displayName)}, ${escape(this.spotifyAuthCode)})`

        await queryAsync(query);
    }

    static async Read(id: number): Promise<Jukebox|null> {
        const query = `select * from jukeboxes where id=${id}`;
        const data  = await queryAsync(query);

        if (!data || data.length == 0) {
            return null;
        }

        return Object.assign(new Jukebox(), data[0]);
    }

    static async ReadAccount(accountId: number): Promise<Jukebox[]> {
        const query = `select * from jukeboxes where ownerId=${escape(accountId)}`;
        const data  = await queryAsync(query) as any[];

        if (!data || data.length == 0) {
            return [];
        }

        return data.map(x => Object.assign(new Jukebox(), x))
    }

    async Update() {
        const data = Object.assign({}, this) as any;
        data.id = undefined;

        const query = `
            update jukeboxes ${sqlSetString(data)} where id=${this.id}
        `;

        await queryAsync(query);
    }

    async Delete() {
        // delete foreign keys that ref this value
        const tokens = await SpotifyAccessToken.ReadJukebox(this.id);
        for (let token of tokens) {
            await token.Delete();
        }

        // delete this value
        const query = `delete from jukeboxes where id=${escape(this.id)}`;
        await queryAsync(query);
    }

    // object that can be sent to client
    CleanObject(): any {
        const obj = Object.assign({}, this) as any;

        if (this.spotifyAuthCode) {
            obj.spotifyAuthCode = true;
        } else {
            obj.spotifyAuthCode = false;
        }

        return obj;
    }
}