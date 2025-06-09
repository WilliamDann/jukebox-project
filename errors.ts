import { NextFunction, Request, Response }  from "express";
import { MysqlError }                       from "mysql";
import Env                                  from "./env";
import AppError from "./error/AppError";

export default function(err: Error, req: Request, res: Response, next: NextFunction)
{
    // if the error is thrown by the app itself
    if (err instanceof AppError)
        return err.render(res);

    // if the error is thrown by mysql
    if ((err as MysqlError).sqlMessage)
    {
        // if it's a mysql error
        Env.getInstance().logger.error(`SqlError: -  ${err.toString()}`);
        res.render('base/error', { error: err.message});
        return;
    }
    
    // if it's just a normal error
    Env.getInstance().logger.error(`${err.constructor.name} -  ${err.toString()}`);
    res.render('base/error', { error: err.toString() });
    return;
}