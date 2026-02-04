import { UsersService } from "../users.service";
import { UsersDBService } from "../users-db.service";
import { AuthService } from "../auth.service";
import { logger } from "../logger.service";
import { User, Role } from "../../models";

jest.mock("../users-db.service");
jest.mock("../logger.service", () => ({
    logger: {
        info: jest.fn()
    }
}));

describe("UsersService", () => {
    let authService: AuthService;
    let usersService: UsersService;

    const mockUser: User = {
        id: 1,
        name: "John Doe",
        email: "john@test.com",
        role: Role.ADMIN
    };

    beforeEach(() => {
        jest.resetAllMocks();
        authService = {
            addAuth: jest.fn()
        } as any;
        usersService = new UsersService(authService);
    });

    test("getUsers returns users from DB service", async () => {
        (UsersDBService.getUsers as jest.Mock).mockResolvedValueOnce([mockUser]);

        const users = await usersService.getUsers();
        expect(users).toEqual([mockUser]);
    });

    test("getUser returns user from DB service", async () => {
        (UsersDBService.getUser as jest.Mock).mockResolvedValueOnce(mockUser);

        const user = await usersService.getUser(1);
        expect(user).toEqual(mockUser);
    });

    test("getUser returns undefined when not found", async () => {
        (UsersDBService.getUser as jest.Mock).mockResolvedValueOnce(undefined);

        const user = await usersService.getUser(99);
        expect(user).toBeUndefined();
    });

    test("addUser returns new user, calls auth service and logs info", async () => {
        (UsersDBService.addUser as jest.Mock).mockResolvedValueOnce(2);

        const newUser = { ...mockUser, id: 0 };
        const result = await usersService.addUser(newUser);

        expect(result).toEqual({ ...newUser, id: 2 });
        expect(authService.addAuth).toHaveBeenCalledWith({ ...newUser, id: 2 });
        expect(logger.info).toHaveBeenCalledWith(
            `User added: ${newUser.email} (ID: 2)`,
            "UsersService"
        );
    });

    test("addUser returns undefined when DB insert fails", async () => {
        (UsersDBService.addUser as jest.Mock).mockResolvedValueOnce(-1);

        const result = await usersService.addUser(mockUser);
        expect(result).toBeUndefined();
        expect(authService.addAuth).not.toHaveBeenCalled();
    });

    test("updateUser returns user and logs info when successful", async () => {
        (UsersDBService.updateUser as jest.Mock).mockResolvedValueOnce(true);

        const result = await usersService.updateUser(mockUser);
        expect(result).toEqual(mockUser);
        expect(logger.info).toHaveBeenCalledWith(
            `User updated: ${mockUser.email} (ID: ${mockUser.id})`,
            "UsersService"
        );
    });

    test("updateUser returns undefined when update fails", async () => {
        (UsersDBService.updateUser as jest.Mock).mockResolvedValueOnce(false);

        const result = await usersService.updateUser(mockUser);
        expect(result).toBeUndefined();
    });

    test("removeUser returns true and logs info when successful", async () => {
        (UsersDBService.removeUser as jest.Mock).mockResolvedValueOnce(true);

        const result = await usersService.removeUser(1);
        expect(result).toBe(true);
        expect(logger.info).toHaveBeenCalledWith(
            `User removed: (ID: 1)`,
            "UsersService"
        );
    });

    test("removeUser returns false when removal fails", async () => {
        (UsersDBService.removeUser as jest.Mock).mockResolvedValueOnce(false);

        const result = await usersService.removeUser(1);
        expect(result).toBe(false);
    });
});
