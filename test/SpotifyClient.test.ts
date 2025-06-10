import assert from 'assert'
import Env from '../env';

describe('SpotifyClient', () => {
    it ('should be loaded', () => {
        assert(Env.getInstance().spotify != null)
    })

    it ('should have valid credentials', () => {
        assert(Env.getInstance().spotify.config.client_id != null, `client_id == ${Env.getInstance().spotify.config.client_id}`)
        assert(Env.getInstance().spotify.config.client_secret != null, `client_secret == ${Env.getInstance().spotify.config.client_secret}`)
    })

    describe('#fetchToken()', () => {
        it ('should return a spotify access token', async () => {
            const token = await Env.getInstance().spotify.fetchToken();

            assert(token != null)
            assert(token.access_token != null)
            assert(token.generatedat != null)
        })
    })

    describe('#currentToken()', () => {
        it ('should return current token if still valid', async () => {
            const token = await Env.getInstance().spotify.fetchToken();
            const got = await Env.getInstance().spotify.currentToken();

            assert(got.access_token == token.access_token)
        });

        it ('should return a new token if expired', async () => {
            Env.getInstance().spotify.token.generatedat = 1;
            const got = await Env.getInstance().spotify.currentToken()

            assert(got.generatedat != 1)
            assert(Env.getInstance().spotify.token.access_token == got.access_token)
        });
    });
});