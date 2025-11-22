import nodemailer from "nodemailer";
import { logger } from "../services";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
    service: env.email.service,
    auth: {
        user: env.email.user,
        pass: env.email.pass,
    }
});

export interface EmailOptions {
    to: string,
    subject: string,
    text?: string,
    html?: string,
}

export class EmailService {
    public static async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const info = await transporter.sendMail({
                from: "SNMP Collector",
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            logger.info(`Email enviado a ${options.to}`, "EmailService");

            return true;
        } catch (error) {
            logger.error("Failed to send email:", "EmailService", error);
            return false;
        }
    }
}