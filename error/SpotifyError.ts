import AppError from "./AppError";

export default class SpotifyError extends AppError
{
    constructor(message: string)
    {
        super("Spotify Error", message);
    }
}