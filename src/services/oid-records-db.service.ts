import { pool } from "../config/db";
import { OidRecord } from "../models";
import { logger } from "./logger.service";

export class OidRecordsDBService {
    public static async addRecord(record: OidRecord): Promise<void> {
        try {
            const query = `
                INSERT INTO records (device_id, oid, value, error, type, date)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
    
            await pool.query(query, [record.deviceId, record.oid, record.value, record.error, record.type, record.date]);
        } catch (err) {
            logger.error(`Failed to insert record (dev: ${record.deviceId}) (oid: ${record.oid}):`, "OidRecordsDBService", err);
        }
    }
}