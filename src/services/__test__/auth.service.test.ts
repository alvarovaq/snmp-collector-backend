import { AuthService } from "../auth.service";
import { AuthDBService } from "../auth-db.service";
import { UsersDBService } from "../users-db.service";
import { EmailService } from "../email.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generator from "generate-password";
import { logger } from "../logger.service";
import { env } from "../../config/env";
import { getPayloadData, verifyToken } from "../../utils/auth";
import { User, Credentials, ChangePasswordReq, ResetPWDTokenReq, ResetPasswordReq, Role } from "../../models";

jest.mock("../auth-db.service", () => ({
    AuthDBService: {
        add: jest.fn(),
        getHash: jest.fn(),
        updatePassword: jest.fn()
    }
}));

jest.mock("../users-db.service", () => ({
    UsersDBService: {
        getUserByEmail: jest.fn()
    }
}));

jest.mock("../email.service", () => ({
    EmailService: {
        sendEmail: jest.fn()
    }
}));

jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn()
}));

jest.mock("generate-password", () => ({
    generate: jest.fn()
}));

jest.mock("../../utils/auth", () => ({
    getPayloadData: jest.fn(),
    verifyToken: jest.fn()
}));

describe("AuthService", () => {
    let service: AuthService;
    const user: User = { id: 1, name: "Test", email: "test@example.com", role: Role.ADMIN } as User;
    const credentials: Credentials = { email: "test@example.com", password: "password" };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AuthService();
    });

    it("should add auth and send email", async () => {
        (generator.generate as jest.Mock).mockReturnValue("Random123");
        (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
        (AuthDBService.add as jest.Mock).mockResolvedValue(true);

        const result = await service.addAuth(user);

        expect(result).toBe(true);
        expect(EmailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: user.email }));
        expect(AuthDBService.add).toHaveBeenCalledWith(user.id, "hashed");
    });

    it("should login and return token", async () => {
        (UsersDBService.getUserByEmail as jest.Mock).mockResolvedValue(user);
        (AuthDBService.getHash as jest.Mock).mockResolvedValue("hashed");
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue("token");

        const result = await service.login(credentials);

        expect(result).toBe("token");
        expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashed");
    });

    it("should return undefined if user not found in login", async () => {
        (UsersDBService.getUserByEmail as jest.Mock).mockResolvedValue(undefined);
        const result = await service.login(credentials);
        expect(result).toBeUndefined();
    });

    it("should renew token if payload exists", () => {
        (getPayloadData as jest.Mock).mockReturnValue({ userId: 1, email: "test@example.com", role: Role.ADMIN });
        (jwt.sign as jest.Mock).mockReturnValue("newtoken");

        const result = service.renewToken("token");

        expect(result).toBe("newtoken");
    });

    it("should return undefined if payload not found on renewToken", () => {
        (getPayloadData as jest.Mock).mockReturnValue(undefined);
        const result = service.renewToken("token");
        expect(result).toBeUndefined();
    });

    it("should change password successfully", async () => {
        (AuthDBService.getHash as jest.Mock).mockResolvedValue("oldhash");
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue("newhash");
        (AuthDBService.updatePassword as jest.Mock).mockResolvedValue(true);

        const req: ChangePasswordReq = { password: "oldpass", newPassword: "newpass" };
        const result = await service.changePassword(1, req);

        expect(result).toBe(true);
        expect(AuthDBService.updatePassword).toHaveBeenCalledWith(1, "newhash");
    });

    it("should get reset password token and send email", async () => {
        (UsersDBService.getUserByEmail as jest.Mock).mockResolvedValue(user);
        (jwt.sign as jest.Mock).mockReturnValue("resettoken");
        (EmailService.sendEmail as jest.Mock).mockResolvedValue(true);

        const req: ResetPWDTokenReq = { email: user.email, url: "http://reset" };
        const result = await service.getResetPasswordToken(req);

        expect(result).toBe(true);
        expect(EmailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: user.email }));
    });

    it("should reset password successfully", async () => {
        (verifyToken as jest.Mock).mockReturnValue(true);
        (getPayloadData as jest.Mock).mockReturnValue({ userId: 1, email: user.email, role: Role.ADMIN });
        (bcrypt.hash as jest.Mock).mockResolvedValue("newhash");
        (AuthDBService.updatePassword as jest.Mock).mockResolvedValue(true);

        const req: ResetPasswordReq = { token: "token", password: "newpass" };
        const result = await service.resetPassword(req);

        expect(result).toBe(true);
        expect(AuthDBService.updatePassword).toHaveBeenCalledWith(1, "newhash");
    });

    it("should fail reset password if token invalid", async () => {
        (verifyToken as jest.Mock).mockReturnValue(false);
        const req: ResetPasswordReq = { token: "token", password: "newpass" };
        const result = await service.resetPassword(req);
        expect(result).toBe(false);
    });
});
