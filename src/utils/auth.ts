import jwt from "jsonwebtoken";
import { PayloadData } from "../models";
import { env } from "../config/env";

interface DecodedTokenPayload extends PayloadData {
    exp?: number;
    iat?: number;
    nbf?: number;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    jti?: string;
}

export const getPayloadData = (token: string): PayloadData | undefined => {
    const decodedPayload = jwt.decode(token) as DecodedTokenPayload | null;
    if (decodedPayload) {
        const { exp, iat, ...payload } = decodedPayload;
        return payload;
    }
    return undefined;
};

export const verifyToken = (token: string): boolean => {
    try {
        return jwt.verify(token, env.auth.jwtSecret) != null;
    } catch (err) {
        return false;
    }
};

export const splitBearerToken = (bearer: string | undefined): string | undefined => {
    if (!bearer || !bearer.startsWith("Bearer ")) return undefined;
    return bearer.split(" ")[1];
};