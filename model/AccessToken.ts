import { escape, Query }    from "mysql"
import queryAsync           from "../util/queryAsync"
import Account              from "./Account";

export default class AccessToken
{
    accesstoken  !: string
    accountid    !: number

    // generate a random token
    static generateToken(): string {
        return Math.random().toString(36).substring(2); 
    }

    static async read(token: string): Promise<AccessToken|null>
    {
        const response = await queryAsync(`select * from accessTokens where accessToken=${escape(token)}`);
        if (!response || response.length == 0)
            return null;

        return Object.assign(new AccessToken(), response[0]);
    }

    static async readAccount(accountId: number): Promise<Account[]> 
    {
        const results = await queryAsync(`select * from accessTokens where accountId=${escape(accountId)}`);

        const objs: Account[] = []
        for (let obj of results) {
            objs.push(Object.assign(new AccessToken(), obj));
        }

        return objs;
    }

    async create(): Promise<Query>
    {
        const response = await queryAsync(`
            insert into
                accessTokens(accessToken, accountId)
                values( ${escape(this.accesstoken)}, ${escape(this.accountid)} );
             `);
        return response;
    }

    async delete(): Promise<Query>
    {
        const result = await queryAsync(`delete from accessTokens where accessToken=${escape(this.accesstoken)}`);
        return result;
    }
}