import { Request, Response } from "express";
import { logger, authService } from "../services";
import { ChangePasswordReq, Credentials } from "../models";
import { getPayloadData, splitBearerToken } from "../utils/auth";
import { ResetPasswordReq, ResetPWDTokenReq } from '../models/auth.model';

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
            const token = splitBearerToken(req.headers.authorization);
            if (!token) return res.status(400).json();
            const newToken = authService.renewToken(token!);
            res.status(200).json(newToken);
        } catch (err) {
            logger.error("Failed to renew", "AuthController", err);
            res.status(500).json();
        }
    }

    public static async changePassword(req: Request, res: Response) {
        try {
            const token = splitBearerToken(req.headers.authorization);
            if (!token)
                return res.status(401).json();
            const payload = getPayloadData(token);
            if (!payload)
                return res.status(400).json();
            const isOk = await authService.changePassword(payload.userId, req.body as ChangePasswordReq);
            if (isOk)
                res.status(200).json();
            else
                res.status(400).json();
        } catch (err) {
            logger.error("Failed to changePassword", "AuthController", err);
            res.status(500).json();
        }
    }

    public static async resetPasswordToken(req: Request, res: Response) {
        try {
            if (await authService.getResetPasswordToken(req.body as ResetPWDTokenReq)) {
                res.status(200).json();
            } else {
                res.status(400).json();
            }
        } catch (err) {
            logger.error("Failed to resetPasswordToken", "AuthController", err);
            res.status(500).json();
        }
    }

    public static async resetPassword(req: Request, res: Response) {
        try {
            if (await authService.resetPassword(req.body as ResetPasswordReq)) {
                res.status(200).json();
            } else {
                res.status(400).json();
            }
        } catch (err) {
            logger.error("Failed to resetPassword", "AuthController", err);
            res.status(500).json();
        }
    }
}
