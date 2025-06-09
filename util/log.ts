import Env from "../env";

export function log(level: string, data: any)
{
    (Env.getInstance().logger as any)[level](data);
}

export function info(data: any)
{
    Env.getInstance().logger.info(data);
}

export function error(data: any)
{
    Env.getInstance().logger.error(data);
}