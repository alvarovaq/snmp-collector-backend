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

    public static async getHash(userId: number): Promise<string | undefined> {
        try {
            const query = "SELECT password FROM usersauth WHERE user_id = $1";
    
            const { rows } = await pool.query(query, [userId]);
            if (!rows.length)
                return undefined;
    
            const row = rows[0];
            return row.password;
        } catch (err) {
            logger.error("Failed to get hash:", "AuthDBService", err);
        }
    
        return undefined;
    }

    public static async updatePassword(id: number, password: string): Promise<boolean> {
        try {
            await pool.query(
                "UPDATE usersauth SET password = $1 WHERE user_id = $2",
                [password, id]
            );

            return true;
        } catch (err) {
            logger.error("Failed to update password:", "AuthDBService", err);
        }

        return false;
    }
}