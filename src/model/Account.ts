import { hashSync, compareSync, genSaltSync } from 'bcrypt'
import {escape}                               from 'mysql'
import queryAsync                             from '../util/queryAsync';
import sqlSetString                           from '../util/sqlSetString';
import Token from './Token';

// user account information
export default class Account {
    id              !: number;
    email           !: string;
    passwordhash    !: string;
    displayName     !: string;

    spotAuthCode    !: string;

    hashPassword(password: string)
    {
        return hashSync(password, genSaltSync(10));
    }

    checkPassword(plainText: string, hashed: string)
    {
        return compareSync(plainText, hashed);
    }

    // create in the db
    public async Create() {
        const query = `
            insert into accounts
                (email, passwordHash, displayName)
            values(
                ${escape(this.email)},
                ${escape(this.passwordhash)},
                ${escape(this.displayName)}
            );
        `;

        await queryAsync(query)
    }

    // get an account by it's id
    static async Read(id: number): Promise<Account|null> {
        const query = `
            select * from accounts where id=${escape(id)}
        `

        let data = await queryAsync(query);
        if (data.length == 0) {
            return null;
        }

        // return new account object 
        return Object.assign(new Account(), data[0])
    }

    // get an account by it's email
    static async ReadEmail(email: string): Promise<Account|null> {
        const query = `select * from accounts where email=${escape(email)}`

        let data = await queryAsync(query);
        if (data.length == 0) {
            return null;
        }

        // return new account object 
        return Object.assign(new Account(), data[0])
    }

    // update in the db
    public async Update() {
        // don't let ids be updated
        const data = Object.assign({}, this) as any;
        delete data.id;

        const query = `
            update accounts ${sqlSetString(data)} where id=${this.id}
        `;

        await queryAsync(query);
    }

    // delete in the db
    public async Delete() {
        // delete sign in tokens for account
        const tokens = await Token.ReadAccountId(this.id);
        for (let token of tokens) {
            token.Delete()
        }

        // delete the user accoutn
        const query = `delete from accounts where id=${this.id}`
        await queryAsync(query)   
    }

    // if the given account info already exists
    public async Exists(): Promise<boolean> {
        const query = `select * from accounts where id=${escape(this.id)} or email=${escape(this.email)}`
        const data  = await queryAsync(query)

        return data.length != 0
    }

    // determine if a given password is a match
    public async PasswordMatch(password: string): Promise<boolean> {
        return this.checkPassword(password, this.passwordhash)
    }

    // get a clean version of the data to send to a client
    public CleanObject(): object {
        let obj = Object.assign({}, this) as any;
        delete obj.passwordHash
        return obj;
    }
}