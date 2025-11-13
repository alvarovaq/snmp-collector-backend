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
}