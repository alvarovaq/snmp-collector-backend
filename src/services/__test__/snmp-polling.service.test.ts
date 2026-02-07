import { SnmpPollingService } from "../snmp-polling.service";
import { SnmpV2CService } from "../snmp-v2c.service";
import { SnmpObjType, SnmpVersion } from "../../models";

jest.useFakeTimers();

jest.mock("../snmp-v2c.service");
jest.mock("../logger.service", () => ({
    logger: { error: jest.fn() }
}));

describe("SnmpPollingService", () => {
    let oidRecordsService: any;
    let rulesService: any;
    let service: SnmpPollingService;

    const device: any = {
        id: 1,
        config: {
            version: SnmpVersion.Version2c,
            ip: "127.0.0.1",
            port: 161,
            community: "public"
        },
        oids: [{ oid: "1.3.6.1.2.1.1.1.0", frequency: 10 }]
    };

    beforeEach(() => {
        jest.clearAllMocks();

        oidRecordsService = {
            setValues: jest.fn().mockReturnValue([
                { value: "x", deviceId: 1, oid: device.oids[0].oid }
            ]),
            cleanDeviceValues: jest.fn()
        };

        rulesService = {
            checkValue: jest.fn()
        };

        (SnmpV2CService.prototype.get as jest.Mock).mockResolvedValue([
            { oid: device.oids[0].oid, value: "x", type: SnmpObjType.BitString }
        ]);

        service = new SnmpPollingService(oidRecordsService);
        service.setRulesService(rulesService);

        jest.useFakeTimers();
    });

    afterEach(() => {
        service.stopAll();
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("stopDevicePolling limpia valores", async () => {
        service.startDevicePolling(device);
        await Promise.resolve();

        service.stopDevicePolling(1);
        jest.advanceTimersByTime(20000);
        await Promise.resolve();

        expect(oidRecordsService.cleanDeviceValues).toHaveBeenCalledWith(1);
    });

    test("stopAll detiene futuros polling", async () => {
        service.startDevicePolling(device);
        await Promise.resolve();

        service.stopAll();
        jest.advanceTimersByTime(20000);
        await Promise.resolve();

        expect(SnmpV2CService.prototype.get).toHaveBeenCalled();
    });
});
