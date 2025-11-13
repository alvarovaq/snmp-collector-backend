import { pool } from "../config/db";
import { logger } from "./logger.service";

export class AuthDBService {
    public static async add(userId: number, hash: string): Promise<boolean> {
        let isOk: boolean = false;
        try {    
            await pool.query(
                "INSERT INTO usersauth (user_id, password) VALUES ($1, $2)",
                [userId, hash]
            );
            
            isOk = true;
        } catch (err) {
            logger.error("Failed to add auth:", "AuthDBService", err);
        }
    
        return isOk;
    }

    public static async getHash(email: string): Promise<string | undefined> {
        try {
            const query = `
                SELECT ua.password
                FROM users u
                INNER JOIN usersauth ua ON ua.user_id = u.id
                WHERE LOWER(u.email) = LOWER($1)
                AND deleted_at IS NULL
            `;
    
            const { rows } = await pool.query(query, [email]);
            if (!rows.length)
                return undefined;
    
            const row = rows[0];
            return row.password;
        } catch (err) {
            logger.error("Failed to get hash:", "AuthDBService", err);
        }
    
        return undefined;
    }
}