import dotenv from "dotenv";
dotenv.config();

export const env = {
    port: Number(process.env.PORT) || 3000,
    db: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        name: process.env.DB_NAME!,
    },
    log: {
        toFile: process.env.LOG_TO_FILE ? process.env.LOG_TO_FILE === "true" : false,
        dir: process.env.LOG_DIR,
        level: process.env.LOG_LEVEL || "INFO",
    },
    snmp: {
        port: Number(process.env.SNMP_PORT),
    },
    auth: {
        enabled: process.env.AUTH_ENABLED ? process.env.AUTH_ENABLED === "true" : true,
        jwtSecret: process.env.AUTH_JWT_SECRET || "mi_clave_secreta",
        jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN ? Number(process.env.AUTH_JWT_EXPIRES_IN) : undefined,
    }
};