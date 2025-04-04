// spotify access token data
export default class SpotifyToken {
    access_token !: string
    token_type   !: string
    expires_in   !: number // how long after generation the token expires
    generated    !: number // when we generated the token
}