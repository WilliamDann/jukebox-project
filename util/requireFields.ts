// returns the missing fields in a given object
export default function requireFields(body: any, fieldNames: string[]): string[]
{
    let missing : string[] = [];

    for (let field of fieldNames)
        if (!body[field])
            missing.push(field);

    return missing;
}