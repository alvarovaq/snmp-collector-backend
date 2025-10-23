import { OidRecord, OidRecordID, SnmpResult, WSEvent, WSMessage } from "../models";
import { OidRecordsDBService } from "./oid-records-db.service";
import { logger } from "./logger.service";
import { WebSocketService } from "./websocket.service";

type RecordKey = `${number}-${string}`;

export class OidRecordsService {
    private records: Map<RecordKey, OidRecord> = new Map();

    public setValues(deviceId: number, results: SnmpResult[]): void {
        const now = new Date();
        const records: OidRecord[] = [];
        for (const result of results) {
            const record = this.setValue(deviceId, result, now);
            if (record) {
                records.push(record);
            }
        }

        if (records.length > 0) {
            const msg: WSMessage = {
                event: WSEvent.UpdateRecords,
                data: records
            }
            WebSocketService.broadcast(msg);
        }
    }

    private setValue(deviceId: number, result: SnmpResult, date: Date): OidRecord | undefined {
        const key = this.makeRecordKey(deviceId, result.oid);

        const lastRecord = this.records.get(key);
        const hasChange = !lastRecord || lastRecord.value !== result.value || lastRecord.error !== result.error;
        
        this.logResult(deviceId, result, hasChange);

        if (hasChange) {
            const record: OidRecord = {
                deviceId,
                oid: result.oid,
                value: result.value,
                error: result.error,
                type: result.type,
                date: date
            };
            
            this.records.set(key, record);
            OidRecordsDBService.addRecord(record);

            return record;
        }

        return undefined;
    }

    private logResult(deviceId: number, result: SnmpResult, hasChange: boolean): void {
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
        const records: OidRecordID[] = [];
        for (const [key, record] of this.records.entries()) {
            if (record.deviceId === deviceId) {
                this.records.delete(key);
                const recordId: OidRecordID = {
                    deviceId: record.deviceId,
                    oid: record.oid
                };
                records.push(recordId);
            }
        }

        const msg: WSMessage = {
            event: WSEvent.RemoveRecords,
            data: records
        }
        WebSocketService.broadcast(msg);
    }

    private makeRecordKey(deviceId: number, oid: string): RecordKey {
        return `${deviceId}-${oid}`;
    }
}