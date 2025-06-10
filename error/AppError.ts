import { Response } from "express";

export default class AppError
{
    title   : string;
    message : string;    

    constructor(title: string, message: string)
    {
        this.title   = title;
        this.message = message;
    }

    toString(): string {
        return `${this.title} - ${this.message}`
    }

    render(res: Response)
    {
        res.render('base/error', { error: `${this.title} - ${this.message}` });
    }
}