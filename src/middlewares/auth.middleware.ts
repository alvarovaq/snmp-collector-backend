import { Request, Response, NextFunction } from "express"
import { env } from "../config/env";
import { authService } from "../services";

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!env.auth.enabled) {
        next();
    } else {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json();
        }

        const token = authHeader.split(" ")[1];
        const payload = authService.verifyToken(token);
        if (!payload) return res.status(401).json();

        next();
    }
};