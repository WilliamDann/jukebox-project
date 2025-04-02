import { hashSync, compareSync, genSaltSync } from 'bcrypt'
import {escape}                               from 'mysql'
import queryAsync                             from '../util/queryAsync';

export default class Account {
    id              !: number;
    email           !: string;
    passwordhash    !: string;
    displayname     !: string;

    private hashPassword(password: string)
    {
        return hashSync(password, genSaltSync(10));
    }

    private checkPassword(plainText: string, hashed: string)
    {
        return compareSync(plainText, hashed);
    }

    public Email(value: string): Account {
        this.email = value;
        return this;
    }

    public Password(value: string): Account {
        this.passwordhash = this.hashPassword(value)
        return this;
    }

    public PasswordHash(value: string): Account {
        this.passwordhash = value;
        return this;
    }

    public DisplayName(value: string): Account {
        this.displayname = value;
        return this;
    }

    // create in the db
    public async Create() {
        const query = `
            insert into accounts
                (email, passwordHash, displayName)
            values(
                ${escape(this.email)},
                ${escape(this.passwordhash)},
                ${escape(this.displayname)}
            );
        `;

        await queryAsync(query)
    }

    // if the given account info already exists
    public async Exists(): Promise<boolean> {
        const query = `select * from accounts where id=${escape(this.id)} or email=${escape(this.email)}`
        const data  = await queryAsync(query)

        return data.length != 0
    }

    // get an account by it's id
    static async Get(id: number): Promise<Account|null> {
        const query = `
            select * from accounts where id=${id}
        `

        let data = await queryAsync(query);
        if (data.length == 0) {
            return null;
        }

        // return new account object 
        return new Account()
            .Email(data[0].email)
            .PasswordHash(data[0].passwordhash)
            .DisplayName(data[0].displayName)
    }
}