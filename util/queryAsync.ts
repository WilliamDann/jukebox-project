import Env from "../env";

export default function(query: string): Promise<any>
{
    const conn = Env.getInstance().db;
    return new Promise((resolve, reject) => {
        Env.getInstance().logger.info("DB Query: " + query);
        conn.query(query, (err, result) => {
            if (err) reject(err);
            else     resolve(result);
        });
    });
}