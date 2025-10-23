import { DeviceConfig, OidConfig, SnmpResult, SnmpVersion, Device } from "../models";
import { SnmpV2CService } from "./snmp-v2c.service";
import { SnmpV3Service } from "./snmp-v3.service";
import { logger } from "./logger.service";
import { OidRecordsService } from "./oid-records.service";

type IntervalKey = `${number}-${string}`;

interface IntervalInfo {
    interval: NodeJS.Timeout;
    deviceId: number;
    oid: string;
};

export class SnmpPollingService
{
    private intervals: Map<IntervalKey, IntervalInfo> = new Map();

    constructor(private readonly oidRecordsService: OidRecordsService) {}

    public startDevicePolling(device: Device): void {
        (async () => {
            await this.requestOids(device.id, device.config, device.oids.map(oidConfig => oidConfig.oid));
            for (const oidConfig of device.oids) {
                this.startPolling(device.id, oidConfig.oid, device.config, oidConfig.frequency);
            }
        })().catch(err => logger.error("Error starting OID polling:", "SnmpPollingService", err));
    }

    public stopDevicePolling(deviceId: number): void {
        for (const [key, info] of this.intervals.entries()) {
            if (info.deviceId === deviceId) {
                clearInterval(info.interval);
                this.intervals.delete(key);
            }
        }
        this.oidRecordsService.cleanDeviceValues(deviceId);
    }

    public restartDevicePolling(device: Device): void {
        this.stopDevicePolling(device.id);
        this.startDevicePolling(device);
    }

    public stopAll(): void {
        for (const info of this.intervals.values()) {
            clearInterval(info.interval);
        }
        this.intervals.clear();
    }

    private startPolling(deviceId: number, oid: string, deviceConfig: DeviceConfig, frequency: number): void {
        const key = this.makeIntervalKey(deviceId, oid);

        if (this.intervals.has(key)) return;

        const interval = setInterval(async () => {
            await this.requestOids(deviceId, deviceConfig, [oid]);
        }, frequency * 1000);

        const info: IntervalInfo = { interval, deviceId, oid };
        this.intervals.set(key, info);
    }

    private async requestOids(deviceId: number, deviceConfig: DeviceConfig, oids: string[]): Promise<void> {
        try {
            const results = await this.getResults(deviceConfig, oids);
            this.oidRecordsService.setValues(deviceId, results);
        } catch (err) {
            logger.error(`Polling error (device: ${deviceId}) (oids: ${oids}):`, "SnmpPollingService", err);
        }
    }

    private async getResults(deviceConfig: DeviceConfig, oids: string[]): Promise<SnmpResult[]> {
        if (deviceConfig.version == SnmpVersion.Version2c) {
            const snmp2 = new SnmpV2CService(deviceConfig.ip, deviceConfig.port, deviceConfig.community!);
            return snmp2.get(oids);
        } else if (deviceConfig.version == SnmpVersion.Version3) {
            const snmp3 = new SnmpV3Service(deviceConfig.ip, deviceConfig.port, deviceConfig.context ?? "", deviceConfig.security!);
            return snmp3.get(oids);
        }

        return [];
    }

    private makeIntervalKey(deviceId: number, oid: string): IntervalKey {
        return `${deviceId}-${oid}`;
    }
}