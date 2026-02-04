import { RulesDBService } from "../rules-db.service";
import { pool } from "../../config/db";
import { logger } from "../logger.service";
import { Operator, Severity, Rule } from "../../models";

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

describe("RulesDBService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getRules", () => {
        it("should return rules", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        name: "Rule 1",
                        operator: Operator.GREATER_THAN,
                        threshold: 10,
                        severity: Severity.CRITICAL,
                    },
                ],
            });

            const rules = await RulesDBService.getRules();

            expect(rules).toHaveLength(1);
            expect(rules[0]).toEqual({
                id: 1,
                name: "Rule 1",
                operator: Operator.GREATER_THAN,
                threshold: 10,
                severity: Severity.CRITICAL,
            });
        });

        it("should return empty array on error", async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error());

            const rules = await RulesDBService.getRules();

            expect(rules).toEqual([]);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("addRule", () => {
        it("should add rule and return id", async () => {
            const client = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)               // BEGIN
                    .mockResolvedValueOnce({ rows: [{ id: 5 }] })  // INSERT
                    .mockResolvedValueOnce(undefined),              // COMMIT
                release: jest.fn(),
            };

            (pool.connect as jest.Mock).mockResolvedValue(client);

            const rule: Rule = {
                id: 0,
                name: "Rule",
                operator: Operator.LESS_THAN,
                threshold: "5",
                severity: Severity.MINOR,
            };

            const id = await RulesDBService.addRule(rule);

            expect(id).toBe(5);
            expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
            expect(client.query).toHaveBeenNthCalledWith(
                2,
                "INSERT INTO rules (name, operator, threshold, severity) VALUES ($1, $2, $3, $4) RETURNING id",
                [rule.name, rule.operator, rule.threshold, rule.severity]
            );
            expect(client.query).toHaveBeenNthCalledWith(3, "COMMIT");
        });

        it("should rollback and return -1 on error", async () => {
            const client = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockRejectedValueOnce(new Error())
                    .mockResolvedValueOnce(undefined),
                release: jest.fn(),
            };

            (pool.connect as jest.Mock).mockResolvedValue(client);

            const id = await RulesDBService.addRule({} as Rule);

            expect(id).toBe(-1);
            expect(client.query).toHaveBeenCalledWith("ROLLBACK");
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("updateRule", () => {
        it("should update rule", async () => {
            const client = {
                query: jest.fn().mockResolvedValue(undefined),
                release: jest.fn(),
            };

            (pool.connect as jest.Mock).mockResolvedValue(client);

            const ok = await RulesDBService.updateRule({
                id: 1,
                name: "Updated",
                operator: Operator.EQUAL,
                threshold: "1",
                severity: Severity.MINOR,
            });

            expect(ok).toBe(true);
            expect(client.query).toHaveBeenCalledWith("COMMIT");
        });

        it("should rollback and return false on error", async () => {
            const client = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockRejectedValueOnce(new Error())
                    .mockResolvedValueOnce(undefined),
                release: jest.fn(),
            };

            (pool.connect as jest.Mock).mockResolvedValue(client);

            const ok = await RulesDBService.updateRule({} as Rule);

            expect(ok).toBe(false);
            expect(client.query).toHaveBeenCalledWith("ROLLBACK");
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("removeRule", () => {
        it("should remove rule", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [{}],
            });

            const ok = await RulesDBService.removeRule(1);

            expect(ok).toBe(true);
        });

        it("should return false when no rows affected", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [],
            });

            const ok = await RulesDBService.removeRule(1);

            expect(ok).toBe(false);
        });

        it("should return false on error", async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error());

            const ok = await RulesDBService.removeRule(1);

            expect(ok).toBe(false);
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
