import generator from "generate-password";
import bcrypt from "bcrypt";
import { logger } from "./logger.service";
import { Credentials, User } from "../models";
import { AuthDBService } from "./auth-db.service";

export class AuthService {
    public async addAuth(user: User): Promise<boolean> {
        const password = this.makeRandomPassword();
        console.log(password);
        const hash = await this.makeHash(password);
        return await AuthDBService.add(user.id, hash);
    }

    public async login(credentials: Credentials): Promise<string | undefined> {
        const hash = await AuthDBService.getHash(credentials.email);
        if (hash === undefined) return undefined;
        const isOk = await this.checkPassword(credentials.password, hash);
        if (!isOk) return undefined;
        return "blablabla";
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
}