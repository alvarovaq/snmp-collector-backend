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
        toFile: Boolean(process.env.LOG_TO_FILE === "true") || false,
        dir: process.env.LOG_DIR,
        level: process.env.LOG_LEVEL || "INFO",
    },
    snmp: {
        port: Number(process.env.SNMP_PORT),
    }
};