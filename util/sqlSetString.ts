import { escape } from "mysql";

export default function(object: any): string
{
    let string = "set ";
    for (let key of Object.keys(object))
        string += `${key}=${escape(object[key])},`;
    return string.substring(0, string.length-1);
}