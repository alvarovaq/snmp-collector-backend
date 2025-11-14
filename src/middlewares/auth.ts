import { Request, Response, NextFunction } from "express"
import { env } from "../config/env";
import { splitBearerToken, verifyToken } from "../utils/auth";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!env.auth.enabled) {
        next();
    } else {
        const authHeader = req.headers.authorization;
        const token = splitBearerToken(authHeader);
        if (!token)
            return res.status(401).json();

        const isOk = verifyToken(token);
        if (!isOk) return res.status(401).json();

        next();
    }
};