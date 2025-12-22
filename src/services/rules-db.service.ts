import { pool } from "../config/db";
import { Rule, Severity, Operator } from "../models";
import { logger } from "./logger.service";

export class RulesDBService {
  public static async getRules(): Promise<Rule[]> {
    try {
        const query = `
            SELECT r.id, r.name, r.name, r.operator, r.threshold, r.severity
            FROM rules r
            WHERE r.deleted_at IS NULL
            ORDER BY r.id;
        `;

        const { rows } = await pool.query(query);
        const rules: Rule[] = [];
        for (const row of rows) {
            const rule: Rule = {
                id: row.id,
                name: row.name,
                operator: row.operator as Operator,
                threshold: row.threshold,
                severity: row.severity as Severity
            };
            rules.push(rule);
        }

        return rules;
    } catch (err) {
        logger.error("Failed to get rules:", "RulesDBService", err);
    }

    return [];
  }

  public static async addRule(rule: Rule): Promise<number> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const result = await client.query(
            "INSERT INTO rules (name, operator, threshold, severity) VALUES ($1, $2, $3, $4) RETURNING id",
            [rule.name, rule.operator, rule.threshold, rule.severity]
        );
        const id = result.rows[0].id;

        if (!id)
            return -1;

        await client.query("COMMIT");

        return id;
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("Failed to add rule:", "RulesDBService", err);
    } finally {
        client.release();
    }

    return -1;
  }

  public static async updateRule(rule: Rule): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(
            "UPDATE rules SET name = $1, operator = $2, threshold = $3, severity = $4 WHERE id = $5",
            [rule.name, rule.operator, rule.threshold, rule.severity, rule.id]
        );

        await client.query("COMMIT");

        return true;
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("Failed to update rule:", "RulesDBService", err);
    } finally {
        client.release();
    }

    return false;
  }

  public static async removeRule(ruleId: number): Promise<boolean> {
    try {
        const query = `
            UPDATE rules SET deleted_at = $1 WHERE id = $2 RETURNING *
        `;

        const { rows } = await pool.query(query, [new Date(), ruleId]);
        return rows.length > 0;
    } catch (err) {
        logger.error("Failed to remove rule:", "RulesDBService", err);
    }

    return false;
  }
}