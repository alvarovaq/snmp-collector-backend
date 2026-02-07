import { logger } from "../logger.service";

jest.mock("../logger.service", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

describe("EmailService", () => {
    let sendMailMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        sendMailMock = jest.fn();
    });

    test("sendEmail returns true when email is sent successfully", async () => {
        jest.isolateModules(async () => {
            const nodemailer = require("nodemailer");
            nodemailer.createTransport = jest.fn().mockReturnValue({
                sendMail: sendMailMock.mockResolvedValue({ messageId: "123" })
            });

            const { EmailService } = require("../email.service");
            const options = {
                to: "test@example.com",
                subject: "Test email",
                text: "Hello"
            };

            const result = await EmailService.sendEmail(options);
            expect(result).toBe(true);
            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
                from: "SNMP Collector",
                to: options.to,
                subject: options.subject,
                text: options.text
            }));
            expect(logger.info).toHaveBeenCalledWith(`Email enviado a ${options.to}`, "EmailService");
        });
    });

    test("sendEmail returns false when sending email fails", async () => {
        jest.isolateModules(async () => {
            const nodemailer = require("nodemailer");
            const error = new Error("SMTP error");
            nodemailer.createTransport = jest.fn().mockReturnValue({
                sendMail: sendMailMock.mockRejectedValue(error)
            });

            const { EmailService } = require("../email.service");
            const options = {
                to: "fail@example.com",
                subject: "Fail email"
            };

            const result = await EmailService.sendEmail(options);
            expect(result).toBe(false);
            expect(logger.error).toHaveBeenCalledWith("Failed to send email:", "EmailService", error);
        });
    });
});
