import { Request, Response } from "express";
import { logger, authService } from "../services";
import { Credentials } from "../models";

export class AuthController {
    public static async login(req: Request, res: Response) {
        try {
            const credentials: Credentials = req.body;
            const token = await authService.login(credentials);
            if (token)
                res.status(200).json(token);
            else
                res.status(401).json();
        } catch (err) {
            logger.error("Failed to login", "AuthController", err);
            res.status(500).json();
        }
    }

    public static renew(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                res.status(400).json();
                return;
            }
            const newToken = authService.renewToken(token!);
            res.status(200).json(newToken);
        } catch (err) {
            logger.error("Failed to renew", "AuthController", err);
            res.status(500).json();
        }
    }
}
