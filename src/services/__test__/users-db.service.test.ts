import { UsersDBService } from "../users-db.service";
import { pool } from "../../config/db";
import { logger } from "../logger.service";
import { User, Role } from "../../models";

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

describe("UsersDBService", () => {
    const mockUser: User = {
        id: 1,
        name: "John Doe",
        email: "john@test.com",
        role: Role.ADMIN
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getUsers returns users list", async () => {
        (pool.query as jest.Mock).mockResolvedValue({
            rows: [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@test.com",
                    role: Role.ADMIN
                }
            ]
        });

        const users = await UsersDBService.getUsers();
        expect(users).toHaveLength(1);
        expect(users[0]).toEqual(mockUser);
    });

    test("getUsers returns empty array on error", async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error("DB Error"));
        const users = await UsersDBService.getUsers();
        expect(users).toEqual([]);
        expect(logger.error).toHaveBeenCalled();
    });

    test("getUser returns user when found", async () => {
        (pool.query as jest.Mock).mockResolvedValue({
            rows: [mockUser]
        });

        const user = await UsersDBService.getUser(1);
        expect(user).toEqual(mockUser);
    });

    test("getUser returns undefined when not found", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
        const user = await UsersDBService.getUser(99);
        expect(user).toBeUndefined();
    });

    test("getUserByEmail returns user", async () => {
        (pool.query as jest.Mock).mockResolvedValue({
            rows: [mockUser]
        });

        const user = await UsersDBService.getUserByEmail("john@test.com");
        expect(user).toEqual(mockUser);
    });

    test("getUserByEmail returns undefined when not found", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
        const user = await UsersDBService.getUserByEmail("no@test.com");
        expect(user).toBeUndefined();
    });

    test("addUser inserts user and returns id", async () => {
        jest.spyOn(UsersDBService, "checkEmail").mockResolvedValue(false);
        (pool.query as jest.Mock).mockResolvedValue({
            rows: [{ id: 2 }]
        });

        const id = await UsersDBService.addUser(mockUser);
        expect(id).toBe(2);
    });

    test("addUser returns -1 when email exists", async () => {
        jest.spyOn(UsersDBService, "checkEmail").mockResolvedValue(true);
        const id = await UsersDBService.addUser(mockUser);
        expect(id).toBe(-1);
    });

    test("updateUser returns true when successful", async () => {
        jest.spyOn(UsersDBService, "checkEmail").mockResolvedValue(false);
        (pool.query as jest.Mock).mockResolvedValue({});

        const result = await UsersDBService.updateUser(mockUser);
        expect(result).toBe(true);
    });

    test("updateUser returns false when email exists", async () => {
        jest.spyOn(UsersDBService, "checkEmail").mockResolvedValue(true);
        const result = await UsersDBService.updateUser(mockUser);
        expect(result).toBe(false);
    });

    test("removeUser returns true when user is deleted", async () => {
        (pool.query as jest.Mock).mockResolvedValue({
            rows: [{ id: 1 }]
        });

        const result = await UsersDBService.removeUser(1);
        expect(result).toBe(true);
    });

    test("removeUser returns false when user not found", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
        const result = await UsersDBService.removeUser(99);
        expect(result).toBe(false);
    });
});
