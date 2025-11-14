import generator from "generate-password";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger.service";
import { Credentials, User } from "../models";
import { AuthDBService } from "./auth-db.service";
import { UsersDBService } from "./users-db.service";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export class AuthService {
    public async addAuth(user: User): Promise<boolean> {
        const password = this.makeRandomPassword();
        const hash = await this.makeHash(password);
        return await AuthDBService.add(user.id, hash);
    }

    public async login(credentials: Credentials): Promise<string | undefined> {
        const user = await UsersDBService.getUserByEmail(credentials.email);
        if (!user) return undefined;
        const hash = await AuthDBService.getHash(user.id);
        if (hash === undefined) return undefined;
        const isOk = await this.checkPassword(credentials.password, hash);
        if (!isOk) return undefined;
        
        const payload: JwtPayload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        return this.makeToken(payload);
    }

    public verifyToken(token: string): JwtPayload | undefined {
        try {
            return jwt.verify(token, env.auth.jwtSecret) as JwtPayload;
        } catch (err) {
            return undefined;
        }
    }

    public renewToken(token: string): string {
        const payload = jwt.decode(token) as JwtPayload;
        const { exp, iat, ...cleanPayload } = payload;
        return this.makeToken(cleanPayload);
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

    private makeToken(payload: JwtPayload): string {
        const options: SignOptions = {
            expiresIn: env.auth.jwtExpiresIn,
        };

        return jwt.sign(payload, env.auth.jwtSecret, options);
    }
}