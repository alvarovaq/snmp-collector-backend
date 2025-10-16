import { Device, OidConfig } from "../models";
import { SnmpPollingService } from "./snmp-polling.service";

export class DevicesService {
    private devices: Map<number, Device> = new Map();
    private nextId = 0;

    constructor(private readonly pollingService: SnmpPollingService) {}

    public getDevices(): Device[] {
        return Array.from(this.devices.values());
    }

    public getDevice(deviceId: number): Device | undefined {
        return this.devices.get(deviceId);
    }

    public addDevice(device: Device): Device {
        const id = this.nextId++;
        const newDevice: Device = { ...device, id };

        this.devices.set(id, newDevice);

        newDevice.oids.forEach((oidConf: OidConfig) => {
            this.pollingService.startOidPolling(id, oidConf.oid, newDevice.config, oidConf.frequency);
        });

        console.log(`[DevicesService] Device added: ${newDevice.name} (ID: ${id})`);

        return newDevice;
    }

    public removeDevice(deviceId: number): void {
        const device = this.devices.get(deviceId);
        if (!device) return;

        this.pollingService.stopDevicePolling(deviceId);
        this.devices.delete(deviceId);
        console.log(`[DevicesService] Device removed: ${device.name} (ID: ${deviceId})`);
    }
}