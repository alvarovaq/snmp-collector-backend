import { DeviceConfig, OidConfig, SnmpResult, SnmpVersion } from "../models";
import { SnmpV2CService } from "./snmp-v2c.service";
import { SnmpV3Service } from "./snmp-v3.service";

export type SnmpPollingCallback = (deviceId: number, oid: string, result: SnmpResult) => void;

type IntervalKey = `${number}-${string}`;

interface IntervalInfo {
    interval: NodeJS.Timeout;
    deviceId: number;
    oid: string;
};

export class SnmpPollingService
{
    private intervals: Map<IntervalKey, IntervalInfo> = new Map();

    constructor(private readonly onResult?: SnmpPollingCallback) {}

    public startOidPolling(deviceId: number, oid: string, deviceConfig: DeviceConfig, frequency: number): void {
        const key = this.makeIntervalKey(deviceId, oid);

        if (this.intervals.has(key)) return;

        const interval = setInterval(async () => {
            try {
                const result = await this.pollOid(deviceConfig, oid);
                if (result !== undefined) {
                    this.onResult?.(deviceId, oid, result);
                }
            }
            catch (err) {
                console.error(`[SnmpPollingService] Polling error (device: ${deviceId}) (oid: ${oid}):`, err);
            }
        }, frequency * 1000);

        const info: IntervalInfo = { interval, deviceId, oid };
        this.intervals.set(key, info);
    }

    public stopOidPolling(deviceId: number, oid: string): void {
        const key = this.makeIntervalKey(deviceId, oid);
        const info = this.intervals.get(key);

        if (info) {
            clearInterval(info.interval);
            this.intervals.delete(key);
        }
    }

    public stopDevicePolling(deviceId: number): void {
        for (const [key, info] of this.intervals.entries()) {
            if (info.deviceId === deviceId) {
                clearInterval(info.interval);
                this.intervals.delete(key);
            }
        }
    }

    public stopAll(): void {
        for (const info of this.intervals.values()) {
            clearInterval(info.interval);
        }
        this.intervals.clear();
    }

    private async pollOid(deviceConfig: DeviceConfig, oid: string): Promise<SnmpResult | undefined> {
        if (deviceConfig.version == SnmpVersion.Version2c) {
            const snmp2 = new SnmpV2CService(deviceConfig.ip, deviceConfig.port, deviceConfig.community!);
            return snmp2.get(oid);
        } else if (deviceConfig.version == SnmpVersion.Version3) {
            const snmp3 = new SnmpV3Service(deviceConfig.ip, deviceConfig.port, deviceConfig.context ?? "", deviceConfig.security!);
            return snmp3.get(oid);
        }

        return undefined;
    }

    private makeIntervalKey(deviceId: number, oid: string): IntervalKey {
        return `${deviceId}-${oid}`;
    }
}