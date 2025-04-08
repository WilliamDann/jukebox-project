import { Response } from "express";
import AppError from "./AppError";

export default class AuthError extends AppError
{
    constructor()
    {
        super('Auth Error', 'Authentication failed.')
    }

    render(res: Response)
    {
        // remove the user's sign in token cookie if we failed to auth
        res.clearCookie('accessToken');

        // render error page
        super.render(res);
    }
}