import fs from "fs";
import path from "path";
import { env } from "../config/env";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class LoggerService {
    private static instance: LoggerService;
    private logToFile: boolean;
    private logDir: string;
    private currentLevel: LogLevel;

    private constructor(logToFile = false, logLevel = LogLevel.INFO) {
        this.logToFile = logToFile;
        this.logDir = env.log.dir ? env.log.dir : path.join(process.cwd(), "logs");
        this.currentLevel = logLevel;

        if (this.logToFile) {
            if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
        const levelFromEnv = (env.log.level || "INFO").toUpperCase();

        const levelMap: Record<string, LogLevel> = {
            ERROR: LogLevel.ERROR,
            WARN: LogLevel.WARN,
            INFO: LogLevel.INFO,
            DEBUG: LogLevel.DEBUG
        };

        const selectedLevel = levelMap[levelFromEnv] ?? LogLevel.INFO;

        LoggerService.instance = new LoggerService(env.log.toFile, selectedLevel);
        }
        return LoggerService.instance;
    }

    private getLocalTimestamp(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    private formatMessage(level: LogLevel, message: string, context?: string): string {
        const timestamp = this.getLocalTimestamp();
        const levelName = LogLevel[level];
        const contextLog = context ? `[${context}] ` : "";
        return `[${timestamp}] [${levelName}] ${contextLog}${message}`;
    }

    private shouldLog(level: LogLevel): boolean {
        return level <= this.currentLevel;
    }

    private getLogFilePath(): string {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0"); 
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        return path.join(this.logDir, `log_${y}${m}${d}_${hh}${mm}${ss}.log`);
    }

    private write(level: LogLevel, message: string, context?: string, error?: any) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message, context);

        switch (level) {
        case LogLevel.ERROR:
            console.error(formatted, error);
            break;
        case LogLevel.WARN:
            console.warn(formatted);
            break;
        case LogLevel.DEBUG:
            console.debug(formatted);
            break;
        default:
            console.log(formatted);
        }

        if (this.logToFile) {
            const logFile = this.getLogFilePath();
            fs.appendFile(logFile, formatted + "\n", (err) => {
                if (err) console.error("[LoggerService] Failed to write log:", err);
            });
        }
    }

    public error(message: string, context?: string, error?: any) {
        this.write(LogLevel.ERROR, message, context, error);
    }

    public warn(message: string, context?: string) {
        this.write(LogLevel.WARN, message, context);
    }

    public info(message: string, context?: string) {
        this.write(LogLevel.INFO, message, context);
    }

    public debug(message: string, context?: string) {
        this.write(LogLevel.DEBUG, message, context);
    }
}

export const logger = LoggerService.getInstance();
