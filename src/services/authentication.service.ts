import generator from "generate-password";
import bcrypt from "bcrypt";
import { logger } from "./logger.service";
import { User } from "../models";
import { AuthenticationDBService } from "./authentication-db.service";

export class AuthenticationService {
    public async add(user: User): Promise<boolean> {
        const password = this.makeRandomPassword();
        const hash = await this.makeHash(password);
        return await AuthenticationDBService.add(user.id, hash);
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
            logger.error("Error al verificar contraseña", "AuthenticationService", error);
        }
        return false;
    }
}