import { OidRecordsDBService } from "../oid-records-db.service";
import { pool } from "../../config/db";
import { logger } from "../logger.service";
import { OidRecord, SnmpObjType } from "../../models";

jest.mock("../../config/db", () => ({
    pool: {
        query: jest.fn(),
    },
}));

jest.mock("../logger.service", () => ({
    logger: {
        error: jest.fn(),
    },
}));

describe("OidRecordsDBService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("addRecord", () => {
        it("should insert a record into database", async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce(undefined);

            const record: OidRecord = {
                deviceId: 1,
                oid: "1.3.6.1.2.1",
                value: "42",
                error: undefined,
                type: SnmpObjType.Integer,
                date: new Date(),
            };

            await OidRecordsDBService.addRecord(record);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO records"),
                [
                    record.deviceId,
                    record.oid,
                    record.value,
                    record.error,
                    record.type,
                    record.date,
                ]
            );
            expect(logger.error).not.toHaveBeenCalled();
        });

        it("should log error if insert fails", async () => {
            const error = new Error("DB error");
            (pool.query as jest.Mock).mockRejectedValueOnce(error);

            const record: OidRecord = {
                deviceId: 1,
                oid: "1.3.6.1.2.1",
                value: "42",
                error: undefined,
                type: SnmpObjType.Integer,
                date: new Date(),
            };

            await OidRecordsDBService.addRecord(record);

            expect(pool.query).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to insert record"),
                "OidRecordsDBService",
                error
            );
        });
    });

    describe("findRecords", () => {
        it("should return records found in database", async () => {
            const rows = [
                {
                    device_id: 1,
                    oid: "1.3.6.1.2.1",
                    value: "10",
                    error: null,
                    type: "number",
                    date: new Date("2024-01-01"),
                },
                {
                    device_id: 1,
                    oid: "1.3.6.1.2.1",
                    value: "20",
                    error: null,
                    type: "number",
                    date: new Date("2024-01-02"),
                },
            ];

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows });

            const result = await OidRecordsDBService.findRecords(
                1,
                "1.3.6.1.2.1",
                new Date("2024-01-01"),
                new Date("2024-01-31")
            );

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                deviceId: 1,
                oid: "1.3.6.1.2.1",
                value: "10",
                error: null,
                type: "number",
                date: new Date("2024-01-01"),
            });
        });

        it("should return empty array if no records found", async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const result = await OidRecordsDBService.findRecords(
                1,
                "1.3.6.1.2.1",
                new Date(),
                new Date()
            );

            expect(result).toEqual([]);
        });

        it("should log error and return empty array on failure", async () => {
            const error = new Error("DB error");
            (pool.query as jest.Mock).mockRejectedValueOnce(error);

            const result = await OidRecordsDBService.findRecords(
                1,
                "1.3.6.1.2.1",
                new Date(),
                new Date()
            );

            expect(result).toEqual([]);
            expect(logger.error).toHaveBeenCalledWith(
                "Faile to find records",
                "OidRecordsDBService",
                error
            );
        });
    });
});
