import { OidRecordsService } from "../oid-records.service";
import { OidRecordsDBService } from "../oid-records-db.service";
import { WebSocketService } from "../websocket.service";
import { logger } from "../logger.service";
import { SnmpObjType, SnmpResult, WSEvent } from "../../models";

jest.mock("../oid-records-db.service", () => ({
    OidRecordsDBService: {
        addRecord: jest.fn(),
    },
}));

jest.mock("../websocket.service", () => ({
    WebSocketService: {
        broadcast: jest.fn(),
    },
}));

jest.mock("../logger.service", () => ({
    logger: {
        debug: jest.fn(),
    },
}));

describe("OidRecordsService", () => {
    let service: OidRecordsService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new OidRecordsService();
    });

    describe("setValues", () => {
        it("should create records and broadcast when values change", () => {
            const results: SnmpResult[] = [
                {
                    oid: "1.3.6.1",
                    value: "10",
                    error: undefined,
                    type: SnmpObjType.Integer,
                },
            ];

            const records = service.setValues(1, results);

            expect(records).toHaveLength(1);
            expect(records[0]).toMatchObject({
                deviceId: 1,
                oid: "1.3.6.1",
                value: "10",
                type: SnmpObjType.Integer,
            });

            expect(OidRecordsDBService.addRecord).toHaveBeenCalledTimes(1);
            expect(WebSocketService.broadcast).toHaveBeenCalledWith({
                event: WSEvent.UpdateRecords,
                data: records,
            });
        });

        it("should NOT broadcast when value does not change", () => {
            const results = [
                {
                    oid: "1.3.6.1",
                    value: "10",
                    error: undefined,
                    type: SnmpObjType.Integer,
                },
            ];

            service.setValues(1, results);
            
            jest.clearAllMocks();
            
            const records = service.setValues(1, results);

            expect(records).toHaveLength(0);
            expect(WebSocketService.broadcast).not.toHaveBeenCalled();
        });

        it("should detect change when error changes", () => {
            service.setValues(1, [
                { oid: "1.3.6.1", value: "10", error: undefined, type: SnmpObjType.Integer },
            ]);

            const records = service.setValues(1, [
                { oid: "1.3.6.1", value: undefined, error: "timeout", type: SnmpObjType.Integer },
            ]);

            expect(records).toHaveLength(1);
            expect(records[0].error).toBe("timeout");
        });
    });

    describe("getValue", () => {
        it("should return last value for device and oid", () => {
            service.setValues(1, [
                { oid: "1.3.6.1", value: "10", error: undefined, type: SnmpObjType.Integer },
            ]);

            const record = service.getValue(1, "1.3.6.1");

            expect(record).toBeDefined();
            expect(record?.value).toBe("10");
        });
    });

    describe("getRecordsByDevice", () => {
        it("should return only records for given device", () => {
            service.setValues(1, [
                { oid: "1.3.6.1", value: "10", error: undefined, type: SnmpObjType.Integer },
            ]);

            service.setValues(2, [
                { oid: "1.3.6.1", value: "20", error: undefined, type: SnmpObjType.Integer },
            ]);

            const records = service.getRecordsByDevice(1);

            expect(records).toHaveLength(1);
            expect(records[0].deviceId).toBe(1);
        });
    });

    describe("getAll", () => {
        it("should return all records", () => {
            service.setValues(1, [
                { oid: "1.3.6.1", value: "10", error: undefined, type: SnmpObjType.Integer },
            ]);

            service.setValues(2, [
                { oid: "1.3.6.2", value: "20", error: undefined, type: SnmpObjType.Integer },
            ]);

            const records = service.getAll();

            expect(records).toHaveLength(2);
        });
    });

    describe("cleanDeviceValues", () => {
        it("should remove device records and broadcast removal", () => {
            service.setValues(1, [
                { oid: "1.3.6.1", value: "10", error: undefined, type: SnmpObjType.Integer },
                { oid: "1.3.6.2", value: "20", error: undefined, type: SnmpObjType.Integer },
            ]);

            service.cleanDeviceValues(1);

            expect(service.getRecordsByDevice(1)).toHaveLength(0);

            expect(WebSocketService.broadcast).toHaveBeenCalledWith({
                event: WSEvent.RemoveRecords,
                data: [
                    { deviceId: 1, oid: "1.3.6.1" },
                    { deviceId: 1, oid: "1.3.6.2" },
                ],
            });
        });
    });
});
