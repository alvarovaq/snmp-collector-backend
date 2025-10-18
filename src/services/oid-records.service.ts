import { OidRecord, SnmpResult } from "../models";
import { OidRecordsDBService } from "./oid-records-db.service";

type RecordKey = `${number}-${string}`;

export class OidRecordsService {
    private records: Map<RecordKey, OidRecord> = new Map();

    public setValue(deviceId: number, oid: string, result: SnmpResult): void {
        const key = this.makeRecordKey(deviceId, oid);

        const lastRecord = this.records.get(key);
        const hasChange = !lastRecord || lastRecord.value !== result.value || lastRecord.error !== result.error;
        if (hasChange) {
            const record: OidRecord = {
                deviceId,
                oid,
                value: result.value,
                error: result.error,
                type: result.type,
                date: new Date()
            };
            
            this.records.set(key, record);
            OidRecordsDBService.addRecord(record);
        }

        const hasValue = result.value !== undefined && result.value !== null;
        if (hasValue) {
            console.log(`[OidRecordsService] (dev: ${deviceId}) (oid: ${oid}) (upd: ${hasChange}): ${result.value}`);
        } else {
            console.log(`[OidRecordsService] (dev: ${deviceId}) (oid: ${oid}) (upd: ${hasChange}) error: ${result.error}`);
        }
    }

    public getValue(deviceId: number, oid: string): OidRecord | undefined {
        const key = this.makeRecordKey(deviceId, oid);
        return this.records.get(key);
    }

    public getRecordsByDevice(deviceId: number): OidRecord[] {
        return Array.from(this.records.values()).filter(record => record.deviceId === deviceId);
    }

    public getAll(): OidRecord[] {
        return Array.from(this.records.values());
    }

    private makeRecordKey(deviceId: number, oid: string): RecordKey {
        return `${deviceId}-${oid}`;
    }
}