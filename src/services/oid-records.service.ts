import { OidRecord, SnmpResult, WSEvent, WSMessage } from "../models";
import { OidRecordsDBService } from "./oid-records-db.service";
import { logger } from "./logger.service";
import { WebSocketService } from "./websocket.service";

type RecordKey = `${number}-${string}`;

export class OidRecordsService {
    private records: Map<RecordKey, OidRecord> = new Map();

    public setValue(deviceId: number, result: SnmpResult): void {
        const key = this.makeRecordKey(deviceId, result.oid);

        const lastRecord = this.records.get(key);
        const hasChange = !lastRecord || lastRecord.value !== result.value || lastRecord.error !== result.error;
        if (hasChange) {
            const record: OidRecord = {
                deviceId,
                oid: result.oid,
                value: result.value,
                error: result.error,
                type: result.type,
                date: new Date()
            };
            
            this.records.set(key, record);
            OidRecordsDBService.addRecord(record);

            const msg: WSMessage = {
                event: WSEvent.UpdateRecord,
                data: record
            }
            WebSocketService.broadcast(msg);
            console.log(msg);
        }

        const hasValue = result.value !== undefined && result.value !== null;
        if (hasValue) {
            logger.debug(`(dev: ${deviceId}) (oid: ${result.oid}) (type: ${result.type}) (upd: ${hasChange}): ${result.value}`, "OidRecordsService");
        } else {
            logger.debug(`(dev: ${deviceId}) (oid: ${result.oid}) (type: ${result.type}) (upd: ${hasChange}) error: ${result.error}`, "OidRecordsService");
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

    public cleanDeviceValues(deviceId: number): void {
        for (const [key, record] of this.records.entries()) {
            if (record.deviceId === deviceId) {
                this.records.delete(key);
            }
        }
    }

    private makeRecordKey(deviceId: number, oid: string): RecordKey {
        return `${deviceId}-${oid}`;
    }
}