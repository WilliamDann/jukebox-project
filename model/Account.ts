import { escape, Query }                        from "mysql"
import queryAsync                               from "../util/queryAsync"
import { genSaltSync, hashSync, compareSync }   from "bcrypt"
import sqlSetString                             from "../util/sqlSetString"
import AccessToken                              from "./AccessToken"
import Profile                                  from "./Profile"
import { info } from "../util/log"

export default class Account {
    id           !: number
    email        !: string
    displayname  !: string
    passwordhash !: string

    constructor() { }

    static hashPassword(plainText: string): string {
        return hashSync(plainText, genSaltSync(10));
    }

    checkPassword(plainText: string): boolean {
        info(plainText)
        info(this.passwordhash)
        return compareSync(plainText, this.passwordhash);
    }

    // if a given user id exists in the db
    static async exists(id: number): Promise<boolean>
    {
        return await this.read(id) == null;
    }

    // if a given email already exists in the db
    static async emailExists(email: string): Promise<boolean>
    {
        return await this.readEmail(email) != null;
    }

    // read from the DB into an Account Object by user id
    static async read(id: number): Promise<Account|null>
    {
        const result = await queryAsync(`select * from accounts where id=${escape(id)}`);
        if (!result || result.length == 0) {
            return null
        }
        return Object.assign(new Account(), result[0]);
    }

    // read from the DB into an Account Object by email
    static async readEmail(email: string): Promise<Account|null>
    {
        const result = await queryAsync(`select * from accounts where email=${escape(email)}`);
        info(result)
        info(JSON.stringify(Object.assign(new Account(), result[0])))
        if (!result || result.length == 0) {
            return null;
        }
        return Object.assign(new Account(), result[0]);
    }

    // create this object in the db
    async create(): Promise<Query>
    {
        const result = await queryAsync(`
            insert into
                accounts(email, displayName, passwordHash)
                values(
                    ${escape(this.email)},
                    ${escape(this.displayname)},
                    ${escape(this.passwordhash)}
                );
            `)
        return result;
    }

    // update this object in the db
    async update(): Promise<Query>
    {
        const result = await queryAsync(`update accounts ${sqlSetString(this)} where id=${escape(this.id)}`);
        return result;
    }

    // delete this object in the db
    async delete(): Promise<Query>
    {
        // remove sign in tokens associated with this account
        for (let token of await AccessToken.readAccount(this.id))
            token.delete();

        // remove profiles assocated with this account
        for (let account of await Profile.readAccount(this.id))
            account.delete();

        // remove the accoutn
        const result = await queryAsync(`delete from accounts where id=${escape(this.id)}`);
        return result;
    }

    // remove sensitive info from the object
    cleanObject(): any {
        const cpy = Object.assign({}, this) as any;
        delete cpy.passwordHash;
        return cpy;
    }
}