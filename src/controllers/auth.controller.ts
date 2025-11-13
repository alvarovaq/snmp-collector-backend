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
}
