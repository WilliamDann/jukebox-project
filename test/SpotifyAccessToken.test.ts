import assert from 'assert'
import SpotifyAccessToken from '../model/SpotifyAccessToken';

function getTestToken(): SpotifyAccessToken {
    const testToken = new SpotifyAccessToken()
    testToken.access_token = 'testToken';
    testToken.refresh_token ='testRefresh';
    testToken.expires_in = "3600"
    testToken.scope = "testScope"
    testToken.profileid = 1
    testToken.generatedat = Date.now()
    return testToken
}

describe('SpotifyAccessToken', () => {
    describe('#expired()', () => {
        it ("should return true when an access token is still valid", () => {
            let token = new SpotifyAccessToken()
            token.expires_in = "3600"

            assert(token.expired() == false, "token should not be marked as expired.")
        });

        it ("should return false when an access token has expired", () => {
            let token = new SpotifyAccessToken()
            token.expires_in = "3600"
            token.generatedat = 1749507765222

            assert(token.expired() == true, "token should be marked as expired.")
        });
    });

    describe('#create', () => {
        // create db object for test token
        before(async () => {
            await getTestToken().create()
        })

        after(async () => {
            await getTestToken().delete()
        });


        it ('should create a token in the db', async () => {
            assert(await SpotifyAccessToken.read('testToken') != null, 'token read from db should exist')
        })

        it ('should create an object in db that matches app memory', async () => {
            const read = (await SpotifyAccessToken.read('testToken') as any)['0'] as SpotifyAccessToken;
            
            const test = getTestToken()
            const keys      = Object.keys(test)

            // don't check genearted at, as the values will be different
            read.generatedat = 1
            test.generatedat = 1
            
            // check if relevant keys match
            for (let key of keys)
                assert(test[key] == read[key], `key=${key} - ${test[key]} != ${read[key]}`)
        })
    });

    describe('#delete', () => {
        // create db object for test token
        before(async () => {
            await getTestToken().create()
        })

        after(async () => {
            await getTestToken().delete()
        });

        it ('should delete the created token', async () => {
            await getTestToken().delete();
            const data = await SpotifyAccessToken.read(getTestToken().access_token)

            assert(data == null, "data should be null")
        });
    });

    describe('#update', () => {
        // create db object for test token
        before(async () => {
            await getTestToken().create()
        })

        after(async () => {
            await getTestToken().delete()
        });


        it ('should create an object in db that matches app memory', async () => {
            const test = getTestToken()
            test.refresh_token = 'newRefreshToken'
            test.generatedat = Date.now()
            test.update()

            const read = (await SpotifyAccessToken.read('testToken') as any)['0'] as SpotifyAccessToken;
            const keys = Object.keys(test)
            
            // check if relevant keys match
            for (let key of keys)
                assert(test[key] == read[key], `key=${key} - ${test[key]} != ${read[key]}`)
        })
    });
})