import { AuthDBService } from "../auth-db.service";
import { pool } from "../../config/db";
import { logger } from "../logger.service";

jest.mock("../../config/db", () => ({
    pool: {
        query: jest.fn()
    }
}));

jest.mock("../logger.service", () => ({
    logger: {
        error: jest.fn()
    }
}));

describe("AuthDBService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("add", () => {
        it("should return true when insert succeeds", async () => {
            (pool.query as jest.Mock).mockResolvedValue(undefined);

            const result = await AuthDBService.add(1, "hash");

            expect(result).toBe(true);
            expect(pool.query).toHaveBeenCalledWith(
                "INSERT INTO usersauth (user_id, password) VALUES ($1, $2)",
                [1, "hash"]
            );
        });

        it("should return false when insert fails", async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error("db error"));

            const result = await AuthDBService.add(1, "hash");

            expect(result).toBe(false);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("getHash", () => {
        it("should return hash when user exists", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [{ password: "hash" }]
            });

            const result = await AuthDBService.getHash(1);

            expect(result).toBe("hash");
            expect(pool.query).toHaveBeenCalledWith(
                "SELECT password FROM usersauth WHERE user_id = $1",
                [1]
            );
        });

        it("should return undefined when user does not exist", async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: []
            });

            const result = await AuthDBService.getHash(1);

            expect(result).toBeUndefined();
        });

        it("should return undefined on error", async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error("db error"));

            const result = await AuthDBService.getHash(1);

            expect(result).toBeUndefined();
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("updatePassword", () => {
        it("should return true when update succeeds", async () => {
            (pool.query as jest.Mock).mockResolvedValue(undefined);

            const result = await AuthDBService.updatePassword(1, "newhash");

            expect(result).toBe(true);
            expect(pool.query).toHaveBeenCalledWith(
                "UPDATE usersauth SET password = $1 WHERE user_id = $2",
                ["newhash", 1]
            );
        });

        it("should return false on error", async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error("db error"));

            const result = await AuthDBService.updatePassword(1, "newhash");

            expect(result).toBe(false);
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
