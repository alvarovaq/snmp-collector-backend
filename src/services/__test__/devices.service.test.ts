import { DevicesService } from "../devices.service";
import { DevicesDBService } from "../devices-db.service";
import { SnmpPollingService } from "../snmp-polling.service";
import { WebSocketService } from "../websocket.service";
import { Device, SnmpV3SecurityLevel, SnmpVersion, WSEvent } from "../../models";
import { OidRecordsService } from '../oid-records.service';

jest.mock("../devices-db.service");
jest.mock("../snmp-polling.service");
jest.mock("../websocket.service");

const mockDevice: Device = {
    id: 1,
    name: "Device 1",
    config: {
        ip: "192.168.1.1",
        port: 161,
        version: SnmpVersion.Version2c,
        community: "public",
        context: "",
        security: {
            level: SnmpV3SecurityLevel.NoAuthNoPriv,
            user: "",
            authProtocol: undefined,
            authKey: undefined,
            privProtocol: undefined,
            privKey: undefined
        }
    },
    oids: [
        {
            oid: "1.3.6.1.2.1.1.1.0",
            name: "sysDescr",
            frequency: 60,
            rules: [1, 2]
        }
    ]
};

describe("DevicesService", () => {
    let oidRecordsService: OidRecordsService;
    let pollingService: SnmpPollingService;
    let service: DevicesService;

    beforeEach(async () => {
        (DevicesDBService.getDevices as jest.Mock).mockResolvedValue([mockDevice]);
        oidRecordsService = new OidRecordsService() as any;
        oidRecordsService.getAll = jest.fn();
        oidRecordsService.getValue = jest.fn();
        oidRecordsService.getRecordsByDevice = jest.fn();
        oidRecordsService.setValues = jest.fn();
        oidRecordsService.cleanDeviceValues = jest.fn();
        pollingService = new SnmpPollingService(oidRecordsService) as any;
        pollingService.startDevicePolling = jest.fn();
        pollingService.restartDevicePolling = jest.fn();
        pollingService.stopDevicePolling = jest.fn();
        service = new DevicesService(pollingService);
        await new Promise(process.nextTick);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("loadDevices initializes devices and starts polling", () => {
        expect(service.getDevices()).toHaveLength(1);
        expect(pollingService.startDevicePolling).toHaveBeenCalledWith(mockDevice);
    });

    test("getDevice returns correct device", () => {
        const device = service.getDevice(1);
        expect(device).toEqual(mockDevice);
        expect(service.getDevice(999)).toBeUndefined();
    });

    test("getRules returns correct rules", () => {
        const rules = service.getRules(1, "1.3.6.1.2.1.1.1.0");
        expect(rules).toEqual([1, 2]);
        expect(service.getRules(1, "wrong")).toEqual([]);
    });

    test("addDevice adds device, broadcasts message and starts polling", async () => {
        const newDevice: Device = { ...mockDevice, id: 2, name: "Device 2" };
        (DevicesDBService.addDevice as jest.Mock).mockResolvedValue(2);
        WebSocketService.broadcast = jest.fn();

        const result = await service.addDevice(newDevice);
        expect(result?.id).toBe(2);
        expect(service.getDevice(2)).toEqual(result);
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.UpdateDevice,
            data: result
        });
        expect(pollingService.startDevicePolling).toHaveBeenCalledWith(result);
    });

    test("updateDevice updates device, broadcasts message and restarts polling", async () => {
        (DevicesDBService.updateDevice as jest.Mock).mockResolvedValue(true);
        WebSocketService.broadcast = jest.fn();

        const updatedDevice = { ...mockDevice, name: "Updated Name" };
        const result = await service.updateDevice(updatedDevice);
        expect(result?.name).toBe("Updated Name");
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.UpdateDevice,
            data: updatedDevice
        });
        expect(pollingService.restartDevicePolling).toHaveBeenCalledWith(updatedDevice);
    });

    test("removeDevice removes device, broadcasts message and stops polling", async () => {
        (DevicesDBService.removeDevice as jest.Mock).mockResolvedValue(true);
        WebSocketService.broadcast = jest.fn();

        const result = await service.removeDevice(1);
        expect(result).toBe(true);
        expect(service.getDevice(1)).toBeUndefined();
        expect(WebSocketService.broadcast).toHaveBeenCalledWith({
            event: WSEvent.RemoveDevice,
            data: 1
        });
        expect(pollingService.stopDevicePolling).toHaveBeenCalledWith(1);
    });

    test("removeRule removes rule from devices and calls DB service", async () => {
        (DevicesDBService.removeOidsRule as jest.Mock).mockResolvedValue(true);
        await service.removeRule(1);
        expect(service.getDevice(1)?.oids[0].rules).toEqual([2]);
        expect(DevicesDBService.removeOidsRule).toHaveBeenCalledWith(1);
    });
});
