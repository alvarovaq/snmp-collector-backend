import generator from "generate-password";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger.service";
import { ChangePasswordReq, Credentials, User, PayloadData } from "../models";
import { AuthDBService } from "./auth-db.service";
import { UsersDBService } from "./users-db.service";
import { env } from "../config/env";
import { getPayloadData } from "../utils/auth";

export class AuthService {
    public async addAuth(user: User): Promise<boolean> {
        const password = this.makeRandomPassword();
        const hash = await this.makeHash(password);

        console.log(password); //REMOVE

        return await AuthDBService.add(user.id, hash);
    }

    public async login(credentials: Credentials): Promise<string | undefined> {
        const user = await UsersDBService.getUserByEmail(credentials.email);
        if (!user) return undefined;
        const hash = await AuthDBService.getHash(user.id);
        if (hash === undefined) return undefined;
        const isOk = await this.checkPassword(credentials.password, hash);
        if (!isOk) return undefined;
        
        const payload: PayloadData = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        return this.makeToken(payload);
    }

    public renewToken(token: string): string | undefined {
        const payload = getPayloadData(token);
        if (!payload) return undefined;
        return this.makeToken(payload);
    }

    public async changePassword(userId: number, req: ChangePasswordReq): Promise<boolean> {
        const hash = await AuthDBService.getHash(userId);
        if (!hash) return false;
        const isOk = await this.checkPassword(req.password, hash);
        if (!isOk) return false;

        const newHash = await this.makeHash(req.newPassword);
        return await AuthDBService.updatePassword(userId, newHash);
    }

    private makeRandomPassword(): string {
        return generator.generate({
            length: 8,
            numbers: true,
            symbols: false,
            uppercase: true,
            excludeSimilarCharacters: true,
        });
    }

    private async makeHash(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    private async checkPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            logger.error("Error al verificar contraseña", "AuthService", error);
        }
        return false;
    }

    private makeToken(payload: PayloadData): string {
        const options: SignOptions = {
            expiresIn: env.auth.jwtExpiresIn,
        };

        return jwt.sign(payload, env.auth.jwtSecret, options);
    }
}