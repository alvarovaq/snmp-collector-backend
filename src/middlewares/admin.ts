import { Request, Response, NextFunction } from "express"
import { env } from "../config/env";
import { splitBearerToken, getPayloadData } from "../utils/auth";
import { Role } from "../models";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!env.auth.enabled) {
        next();
    } else {
        const authHeader = req.headers.authorization;
        const token = splitBearerToken(authHeader);
        if (!token)
            return res.status(401).json();
        
        const payload = getPayloadData(token);
        if (!payload)
            return res.status(401).json();

        if (payload.role != Role.ADMIN)
            return res.status(403).json();

        next();
    }
};