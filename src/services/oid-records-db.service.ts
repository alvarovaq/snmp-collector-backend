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

    public static async findRecords(deviceId: number, oid: string, start: Date, end: Date) : Promise<OidRecord[]>
    {
        try {
            const query = `
                SELECT device_id, oid, value, error, type, date
                FROM records
                WHERE device_id = $1
                AND oid = $2
                AND date >= $3
                AND date <= $4
                ORDER BY date;
            `;
    
            const { rows } = await pool.query(query, [deviceId, oid, start, end]);
            const records: OidRecord[] = [];
            for (const row of rows) {
                const record: OidRecord = {
                    deviceId: row.device_id,
                    oid: row.oid,
                    value: row.value,
                    error: row.error,
                    type: row.type,
                    date: row.date
                };
                records.push(record);
            }
    
            return records;
        } catch (err) {
            logger.error("Faile to find records", "OidRecordsDBService", err);
        }

        return [];
    }
}