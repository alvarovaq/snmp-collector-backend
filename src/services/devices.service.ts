import { Device, OidConfig } from "../models";
import { DevicesDBService } from "./devices-db.service";
import { SnmpPollingService } from "./snmp-polling.service";

export class DevicesService {
    private devices: Map<number, Device> = new Map();
    private nextId = 0;

    constructor(private readonly pollingService: SnmpPollingService) {
        this.loadDevices();
    }

    private async loadDevices(): Promise<void> {
        console.log("[DevicesService] Loading devices from BBDD");
        const devices = await DevicesDBService.getDevices();
        devices.forEach(device => {
            this.devices.set(device.id, device);
            this.startDevicePolling(device);
        });
        console.log(`[DevicesService] ${devices.length} devices loaded`);
    }

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
        this.startDevicePolling(newDevice);

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

    private startDevicePolling(device: Device): void {
        device.oids.forEach((oidConf: OidConfig) => {
            this.pollingService.startOidPolling(device.id, oidConf.oid, device.config, oidConf.frequency);
        });       
    }
}