import { NextFunction, Request, Response }  from "express";
import Env                                  from "./env";
import AppError from "./error/AppError";

export default function(err: Error, req: Request, res: Response, next: NextFunction)
{
    // if the error is thrown by the app itself
    if (err instanceof AppError)
        return err.render(res);
    
    // if it's just a normal error
    Env.getInstance().logger.error(`${err.constructor.name} -  ${err.toString()}`);
    res.render('base/error', { error: err.toString() });
    return;
}