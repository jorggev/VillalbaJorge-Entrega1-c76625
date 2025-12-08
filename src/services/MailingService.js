import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export default class MailingService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            }
        });
    }

    async sendSimpleMail({ from, to, subject, html, attachments = [] }) {
        const result = await this.transporter.sendMail({
            from,
            to,
            subject,
            html,
            attachments
        });
        return result;
    }
}
