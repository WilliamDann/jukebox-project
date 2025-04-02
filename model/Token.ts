import { escape }    from "mysql"
import queryAsync    from "../util/queryAsync";
import {randomBytes} from 'crypto'

// tokens are generated when a valid sign-in occors
export default class Token {
    token       !: string
    accountId   !: number

    constructor() {}

    // generate a random string and assign it as our token value
    public Generate(): Token {
        this.token = randomBytes(16).toString('hex');
        return this;
    }

    // check if a token is correct for an account
    public Check(accountId: number): boolean {
        return this.accountId == accountId;
    }

    // setters
    public Token(value: string): Token {
        this.token = value;
        return this;
    }

    public AccountId(value: number): Token {
        this.accountId = value;
        return this;
    }

    // create in the db
    public async Create() {
        const query = `
            insert into tokens
                (token, accountId) 
            values(
                ${escape(this.token)},
                ${escape(this.accountId)}
            )
        `;

        await queryAsync(query);
    }

    // get from the db
    public static async Read(token: string): Promise<Token|null> {
        const query = `select * from tokens where token=${escape(token)}`
        const data  = await queryAsync(query);

        if (data.length == 0) {
            return null;
        }

        return new Token()
            .Token(token)
            .AccountId(data[0].accountId)
    }

    // get tokens that exist for a given accoutn id
    public static async ReadAccountId(accountId: number): Promise<Token[]> {
        const query = `select * from tokens where accountId=${escape(accountId)}`;
        const data  = await queryAsync(query);

        const results: Token[] = [];
        for (let result of data) {
            results.push(new Token().Token(result.token).AccountId(result.accountId));
        }

        return results;
    }

    // delete in the db
    public async Delete() {
        const query = `delete from tokens where token=${escape(this.token)}`
        await queryAsync(query)   
    }
}