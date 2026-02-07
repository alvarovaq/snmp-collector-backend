import fs from "fs";
import path from "path";
import { LoggerService, LogLevel } from "../logger.service";
import { env } from "../../config/env";

jest.mock("fs", () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    appendFile: jest.fn()
}));

jest.mock("../../config/env", () => ({
    env: {
        log: {
            toFile: false,
            level: "INFO",
            dir: "/logs"
        }
    }
}));

describe("LoggerService", () => {
    let logger: LoggerService;

    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    const consoleDebug = jest.spyOn(console, "debug").mockImplementation(() => {});

    beforeEach(() => {
        jest.clearAllMocks();
        (LoggerService as any).instance = undefined;
        logger = LoggerService.getInstance();
    });

    afterAll(() => {
        consoleError.mockRestore();
        consoleWarn.mockRestore();
        consoleLog.mockRestore();
        consoleDebug.mockRestore();
    });

    it("should return singleton instance", () => {
        const other = LoggerService.getInstance();
        expect(other).toBe(logger);
    });

    it("should log info messages", () => {
        logger.info("info message", "Test");

        expect(consoleLog).toHaveBeenCalled();
    });

    it("should log warn messages", () => {
        logger.warn("warn message", "Test");

        expect(consoleWarn).toHaveBeenCalled();
    });

    it("should log error messages", () => {
        logger.error("error message", "Test", new Error("err"));

        expect(consoleError).toHaveBeenCalled();
    });

    it("should log debug messages when level allows", () => {
        (env.log.level as any) = "DEBUG";
        (LoggerService as any).instance = undefined;

        const debugLogger = LoggerService.getInstance();
        debugLogger.debug("debug message");

        expect(consoleDebug).toHaveBeenCalled();
    });

    it("should not log debug messages when level is INFO", () => {
        (env.log.level as any) = "INFO";
        (LoggerService as any).instance = undefined;

        const infoLogger = LoggerService.getInstance();
        infoLogger.debug("debug message");

        expect(consoleDebug).not.toHaveBeenCalled();
    });

    it("should write logs to file when enabled", () => {
        (env.log.toFile as any) = true;
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (LoggerService as any).instance = undefined;

        const fileLogger = LoggerService.getInstance();
        fileLogger.info("file log");

        expect(fs.appendFile).toHaveBeenCalled();
    });

    it("should create log directory if it does not exist", () => {
        (env.log.toFile as any) = true;
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        (LoggerService as any).instance = undefined;

        LoggerService.getInstance();

        expect(fs.mkdirSync).toHaveBeenCalledWith("/logs", { recursive: true });
    });
});
