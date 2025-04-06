import { Request, Response, NextFunction } from "express";
import Token from "./model/Token";
import Env from "./env";

// middelware for vailidating user sign-ins
export default async function (req: Request, res: Response, next: NextFunction) {
    const accountId = req.cookies.accountId;
    const token     = req.cookies.token;

    // if is not signed in
    if (!accountId && !token) {
        next();
        return;
    }
    
    // if the token is not found or is invalid, fail
    const tokenObj   = await Token.Read(token)
    if (!tokenObj || !tokenObj.Check(accountId)) {
        res.clearCookie('accountId');
        res.clearCookie('token');

        return res.render('base/error', { error: "Failed to auth account." });
    }

    // allow the request
    next();
}