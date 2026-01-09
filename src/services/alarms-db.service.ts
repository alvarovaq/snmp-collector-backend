import { pool } from "../config/db";
import { Alarm, Severity } from "../models";
import { logger } from "./logger.service";

export class AlarmsDBService {
  public static async getAlarms(): Promise<Alarm[]> {
    try {
        const query = `
            SELECT id, device_id, oid, rule_id, severity, message, date, readed
            FROM alarms
            WHERE closed_at IS NULL
            ORDER BY id;
        `;

        const { rows } = await pool.query(query);
        const alarms: Alarm[] = [];
        for (const row of rows) {
            const alarm: Alarm = {
                id: row.id,
                deviceId: row.device_id,
                oid: row.oid,
                ruleId: row.rule_id,
                severity: row.severity as Severity,
                message: row.message,
                date: new Date(row.date),
                closedAt: null,
                readed: row.readed
            };
            alarms.push(alarm);
        }

        return alarms;
    } catch (err) {
        logger.error("Failed to get alarms:", "AlarmsDBService", err);
    }

    return [];
  }

  public static async addAlarm(alarm: Alarm): Promise<number> {
    const client = await pool.connect();
    try {
        const result = await client.query(
            "INSERT INTO alarms (device_id, oid, rule_id, severity, message, date, closed_at, readed) VALUES ($1, $2, $3, $4, $5, $6, NULL, false) RETURNING id",
            [alarm.deviceId, alarm.oid, alarm.ruleId, alarm.severity, alarm.message, alarm.date]
        );

        return result.rows[0].id;
    } catch (err) {
        logger.error("Failed to add alarm:", "AlarmsDBService", err);
    } finally {
        client.release();
    }

    return -1;
  }

  public static async updateAlarm(alarm: Alarm): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query(
            "UPDATE alarms SET device_id = $1, oid = $2, rule_id = $3, severity = $4, message = $5, date = $6, readed = $7 WHERE id = $8",
            [alarm.deviceId, alarm.oid, alarm.ruleId, alarm.severity, alarm.message, alarm.date, alarm.readed, alarm.id]
        );

        return true;
    } catch (err) {
        logger.error("Failed to update alarm:", "AlarmsDBService", err);
    } finally {
        client.release();
    }

    return false;
  }

  public static async removeAlarm(alarm_id: number): Promise<boolean> {
    try {
        const query = `
            UPDATE alarms SET closed_at = $1 WHERE id = $2 RETURNING *
        `;

        const { rows } = await pool.query(query, [new Date(), alarm_id]);
        return rows.length > 0;
    } catch (err) {
        logger.error("Failed to remove alarm:", "AlarmsDBService", err);
    }

    return false;
  }

  public static async closeAlarms(): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query(
            "UPDATE alarms SET closed_at = $1 WHERE closed_at IS NULL",
            [new Date()]
        );

        return true;
    } catch (err) {
        logger.error("Failed to close alarms:", "AlarmsDBService", err);
    } finally {
        client.release();
    }

    return false;
  }
}