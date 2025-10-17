import { OidRecord, SnmpResult } from "../models";

type RecordKey = `${number}-${string}`;

export class OidRecordsService {
    private records: Map<RecordKey, OidRecord> = new Map();

    public setValue(deviceId: number, oid: string, result: SnmpResult): void {
        const key = this.makeRecordKey(deviceId, oid);

        const record: OidRecord = {
            deviceId,
            oid,
            value: result.value,
            error: result.error,
            timestamp: Date.now()
        };

        this.logRecord(record);
        this.records.set(key, record);
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

    private logRecord(record: OidRecord): void {
        const hasValue = record.value !== undefined && record.value !== null;
        const status = hasValue ? "value" : "error";
        const value = record.value ?? record.error ?? "-";
        console.log(`[OidRecordsService] (dev: ${record.deviceId}) (oid: ${record.oid}) (${status}): ${value}`);
    }
}