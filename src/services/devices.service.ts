import { Device, OidConfig } from "../models";
import { DevicesDBService } from "./devices-db.service";
import { SnmpPollingService } from "./snmp-polling.service";
import { logger } from "./logger.service";

export class DevicesService {
    private devices: Map<number, Device> = new Map();
    private nextId = 0;

    constructor(private readonly pollingService: SnmpPollingService) {
        this.loadDevices();
    }

    private async loadDevices(): Promise<void> {
        logger.info("Loading devices from BBDD", "DevicesService");
        const devices = await DevicesDBService.getDevices();
        devices.forEach(device => {
            this.devices.set(device.id, device);
            this.startDevicePolling(device);
        });
        logger.info(`${devices.length} devices loaded`, "DevicesService");
    }

    public getDevices(): Device[] {
        return Array.from(this.devices.values());
    }

    public getDevice(deviceId: number): Device | undefined {
        return this.devices.get(deviceId);
    }

    public async addDevice(device: Device): Promise<Device | undefined> {
        const id = await DevicesDBService.addDevice(device);
        if (id === -1)
            return undefined;

        const newDevice: Device = { ...device, id };

        this.devices.set(id, newDevice);
        this.startDevicePolling(newDevice);

        logger.info(`Device added: ${newDevice.name} (ID: ${id})`, "DevicesService");

        return newDevice;
    }

    public async updateDevice(device: Device): Promise<Device | undefined> {
        if (!this.devices.get(device.id))
            return undefined;

        const ok = await DevicesDBService.updateDevice(device);
        if (!ok)
            return undefined;

        this.devices.set(device.id, device);
        this.pollingService.stopDevicePolling(device.id);
        this.startDevicePolling(device);

        logger.info(`Device updated: ${device.name} (ID: ${device.id})`, "DevicesService");
        return device;
    }

    public async removeDevice(deviceId: number): Promise<boolean> {
        const device = this.devices.get(deviceId);
        if (!device)
            return false;

        const ok = await DevicesDBService.removeDevice(deviceId);
        if (!ok)
            return false;

        this.pollingService.stopDevicePolling(deviceId);
        this.devices.delete(deviceId);
        logger.info(`Device removed: ${device.name} (ID: ${deviceId})`, "DevicesService");

        return true;
    }

    private startDevicePolling(device: Device): void {
        device.oids.forEach((oidConf: OidConfig) => {
            this.pollingService.startOidPolling(device.id, oidConf.oid, device.config, oidConf.frequency);
        });       
    }
}