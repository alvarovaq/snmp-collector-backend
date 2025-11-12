import { pool } from "../config/db";
import { User, Role } from "../models";
import { logger } from "./logger.service";

export class UsersDBService {
  public static async getUsers(): Promise<User[]> {
    try {
        const query = `
            SELECT id, name, email, role
            FROM users
            WHERE deleted_at IS NULL
            ORDER BY id;
        `;

        const { rows } = await pool.query(query);
        const users: User[] = [];
        for (const row of rows) {
            const user: User = {
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role as Role,
            };
            users.push(user);
        }

        return users;
    } catch (err) {
        logger.error("Failed to get users:", "UsersDBService", err);
    }

    return [];
  }

  public static async getUser(userId: number): Promise<User | undefined> {
    try {
        const query = `
            SELECT id, name, email, role
            FROM users
            WHERE deleted_at IS NULL
            AND id = $1
        `;

        const { rows } = await pool.query(query, [userId]);
        if (!rows.length)
            return undefined;

        const row = rows[0];
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role as Role,
        } as User;
    } catch (err) {
        logger.error("Failed to get users:", "UsersDBService", err);
    }

    return undefined;
  }

  public static async addUser(user: User): Promise<number> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const result = await client.query(
            "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id",
            [user.name, user.email, user.role]
        );
        const id = result.rows[0].id;

        if (!id)
            return -1;

        await client.query("COMMIT");

        return id;
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("Failed to add user:", "UsersDBService", err);
    } finally {
        client.release();
    }

    return -1;
  }

  public static async updateUser(user: User): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(
            "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4",
            [user.name, user.email, user.role, user.id]
        );

        await client.query("COMMIT");

        return true;
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("Failed to update user:", "UsersDBService", err);
    } finally {
        client.release();
    }

    return false;
  }

  public static async removeUser(user_id: number): Promise<boolean> {
    try {
        const query = `
            UPDATE users SET deleted_at = $1 WHERE id = $2 RETURNING *
        `;

        const { rows } = await pool.query(query, [new Date(), user_id]);
        return rows.length > 0;
    } catch (err) {
        logger.error("Failed to remove user:", "UsersDBService", err);
    }

    return false;
  }
}