import AppError from "./AppError";

export default class InvalidRequestError extends AppError
{
    constructor(message: string)
    {
        super('Invalid Request', message);
    }
}