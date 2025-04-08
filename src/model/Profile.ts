import { escape, Query }    from "mysql"
import queryAsync           from "../util/queryAsync"
import sqlSetString         from "../util/sqlSetString"

export default class Profile
{
    id              !: number
    displayName     !: string
    accountId       !: number
    spotAuthToken   !: string

    static async read(id: number): Promise<Profile|null>
    {
        const results = await queryAsync(`select * from profiles where id=${escape(id)}`);
        if (!results || results.length == 0)
            return null;

        return Object.assign(new Profile(), results[0]);
    }

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

    async create(): Promise<Query>
    {
        const results = await queryAsync(`
            insert into
                profiles(displayName, accountId)
                values(${escape(this.displayName)}, ${escape(this.accountId)})
            `)
        return results;
    }

    async update(): Promise<Query>
    {
        const result = await queryAsync(`update profiles set ${sqlSetString(this)}where id=${escape(this.id)}`);
        return result;
    }

    async delete(): Promise<Query>
    {
        const result = await queryAsync(`delete from profiles where id=${escape(this.id)}`);
        return result;
    }

    cleanObject() {
        const copy = Object.assign({}, this) as any;
        delete copy.spotAuthToken;
        return copy;
    }
}