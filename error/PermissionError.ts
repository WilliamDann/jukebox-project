import AppError from "./AppError";

export default class PermissionError extends AppError
{
    constructor()
    {
        super('Permission Error', 'You do not have permission to perform this request');
    }
}