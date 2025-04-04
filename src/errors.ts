import { NextFunction, Request, Response }  from "express";
import { MysqlError }                       from "mysql";
import Env from "./env";

export default function(err: Error, req: Request, res: Response, next: NextFunction)
{
    if ((err as MysqlError).sqlMessage)
    {
        // if it's a mysql error
        Env.getInstance().logger.error(`SqlError: -  ${err.toString()}`);
        res.render('page/error', { error: { title: "SQL Error", text: err.message } });
        return;
    } else 
    {
        // if it's just a normal error
        Env.getInstance().logger.error(`${err.constructor.name} -  ${err.toString()}`);
        res.render('base/error', { error: err.toString() });
        return;
    }
}