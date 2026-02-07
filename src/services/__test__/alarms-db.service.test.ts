import { AlarmsDBService } from "../alarms-db.service";
import { pool } from "../../config/db";
import { logger } from "../logger.service";
import { Alarm, Severity } from "../../models";

jest.mock("../../config/db", () => ({
    pool: {
        query: jest.fn(),
        connect: jest.fn(),
    },
}));

jest.mock("../logger.service", () => ({
    logger: {
        error: jest.fn(),
    },
}));

describe("AlarmsDBService", () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),

    };

    beforeEach(() => {
        jest.clearAllMocks();
        (pool.connect as jest.Mock).mockResolvedValue(mockClient);
    });

    describe("getAlarms", () => {
        it("should return alarms when query succeeds", async () => {
            const rows = [
                {
                    id: 1,
                    device_id: 1,
                    oid: "1.3.6",
                    rule_id: 10,
                    severity: Severity.MAJOR,
                    message: "Test alarm",
                    date: new Date().toISOString(),
                    readed: false,
                },
            ];

            (pool.query as jest.Mock).mockResolvedValue({ rows });

            const result = await AlarmsDBService.getAlarms();

            expect(pool.query).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: 1,
                deviceId: 1,
                ruleId: 10,
                severity: Severity.MAJOR,
                message: "Test alarm",
                readed: false,
            });
        });

        it("should return empty array on error", async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error("DB error"));

            const result = await AlarmsDBService.getAlarms();

            expect(logger.error).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("addAlarm", () => {
        it("should insert alarm and return id", async () => {
            mockClient.query.mockResolvedValue({
                rows: [{ id: 123 }],
            });

            const alarm: Alarm = {
                id: 0,
                deviceId: 1,
                oid: "1.3.6",
                ruleId: 10,
                severity: Severity.MAJOR,
                message: "New alarm",
                date: new Date(),
                closedAt: null,
                readed: false,
            };

            const result = await AlarmsDBService.addAlarm(alarm);

            expect(mockClient.query).toHaveBeenCalled();
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toBe(123);
        });

        it("should return -1 on error", async () => {
            mockClient.query.mockRejectedValue(new Error("Insert failed"));

            const result = await AlarmsDBService.addAlarm({} as Alarm);

            expect(logger.error).toHaveBeenCalled();
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toBe(-1);
        });
    });

    describe("updateAlarm", () => {
        it("should return true when update succeeds", async () => {
            mockClient.query.mockResolvedValue({});

            const result = await AlarmsDBService.updateAlarm({} as Alarm);

            expect(result).toBe(true);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should return false on error", async () => {
            mockClient.query.mockRejectedValue(new Error("Update failed"));

            const result = await AlarmsDBService.updateAlarm({} as Alarm);

            expect(logger.error).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe("updateReaded", () => {
        it("should update readed flag", async () => {
            mockClient.query.mockResolvedValue({});

            const result = await AlarmsDBService.updateReaded(1, true);

            expect(result).toBe(true);
            expect(mockClient.query).toHaveBeenCalledWith(
                "UPDATE alarms SET readed = $1 WHERE id = $2",
                [true, 1]
            );
        });
    });

    describe("removeAlarm", () => {
        it("should return true if alarm was closed", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [{ id: 1 }],
            });

            const result = await AlarmsDBService.removeAlarm(1);

            expect(result).toBe(true);
        });

        it("should return false if no rows affected", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [],
            });

            const result = await AlarmsDBService.removeAlarm(1);

            expect(result).toBe(false);
        });
    });

    describe("closeAlarms", () => {
        it("should close all alarms", async () => {
            mockClient.query.mockResolvedValue({});

            const result = await AlarmsDBService.closeAlarms();

            expect(result).toBe(true);
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});
