import AppError from "./AppError";

export default class AuthError extends AppError
{
    constructor()
    {
        super('Auth Error', 'Authentication failed.')
    }
}