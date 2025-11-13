import generator from "generate-password";
import bcrypt from "bcrypt";
import { logger } from "./logger.service";

export class AuthenticationService {
    private makeRandomPassword (): string {
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