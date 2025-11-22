import generator from "generate-password";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger.service";
import { ChangePasswordReq, Credentials, User, PayloadData, ResetPWDTokenReq, ResetPasswordReq } from "../models";
import { AuthDBService } from "./auth-db.service";
import { UsersDBService } from "./users-db.service";
import { env } from "../config/env";
import { getPayloadData, verifyToken } from "../utils/auth";
import { EmailService, EmailOptions } from './email.service';

export class AuthService {
    public async addAuth(user: User): Promise<boolean> {
        const password = this.makeRandomPassword();
        const hash = await this.makeHash(password);

        const options: EmailOptions = {
            to: user.email,
            subject: "Bienvenido a nuestra plataforma",
            html: `
                <h1>Hola ${user.name},</h1>
                <p>¡Bienvenido a nuestra plataforma!</p>
                <p>Tu contraseña para poder acceder es: <strong>${password}</strong>. Cámbiala lo antes posible.</p>
            `,
        };
        EmailService.sendEmail(options);

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

    public async getResetPasswordToken(req: ResetPWDTokenReq): Promise<boolean> {
        const user = await UsersDBService.getUserByEmail(req.email);
        if (!user) return false;
        const payload: PayloadData = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        const token = this.makeToken(payload);
        const url = req.url + "/" + token;

        const options: EmailOptions = {
            to: user.email,
            subject: "Recuperación de contraseña",
            text: `
                Hola ${user.name},

                Hemos recibido una solicitud para restablecer tu contraseña.
                Para continuar, haz clic en el siguiente enlace:

                ${url}

                Si no solicitaste este cambio, puedes ignorar este correo.

                Gracias,
            `,
        };
        return await EmailService.sendEmail(options);
    }

    public async resetPassword(req: ResetPasswordReq): Promise<boolean> {
        if (!verifyToken(req.token)) return false;

        const payload = getPayloadData(req.token);
        if (!payload) return false;

        const hash = await this.makeHash(req.password);
        return await AuthDBService.updatePassword(payload.userId, hash);
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