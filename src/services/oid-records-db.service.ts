import { pool } from "../config/db";
import { OidRecord } from "../models";

export class OidRecordsDBService {
    public static async addRecord(record: OidRecord): Promise<void> {
        try {
            const query = `
                INSERT INTO records (device_id, oid, value, error, type, date)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
    
            await pool.query(query, [record.deviceId, record.oid, record.value, record.error, record.type, record.date]);
        } catch (err) {
            console.error("[OidRecordsDBService] Failed to insert record:", err);
        }
    }
}