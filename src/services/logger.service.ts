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
  private logFilePath: string;
  private currentLevel: LogLevel;

  private constructor(logToFile = false, fileName = "app.log", logLevel = LogLevel.INFO) {
    this.logToFile = logToFile;
    this.logFilePath = path.join(process.cwd(), "logs", fileName);
    this.currentLevel = logLevel;

    if (this.logToFile) {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
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

      LoggerService.instance = new LoggerService(env.log.toFile, "app.log", selectedLevel);
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
      fs.appendFile(this.logFilePath, formatted + "\n", (err) => {
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
