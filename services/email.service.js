import nodemailer from "nodemailer";

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendEmail({to, subject, html, text}) {
        return await this.transporter.sendMail({
            from: `"${process.env.APP_NAME || "Gym Management"}" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            text,
            html
        });
    }

    async sendOtpEmail(email, otp) {

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
                <h2>OTP Verification</h2>
                <p>Your verification code is:</p>
                <h1 style="letter-spacing: 4px;">${otp}</h1>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
            </div>
        `;

        return await this.sendEmail({
            to: email,
            subject: "OTP Verification",
            html
        });
    }

    async sendWelcomeEmail(name, email) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
                <h2>Welcome ${name} 🎉</h2>
                <p>Your account has been successfully created.</p>
                <p>Thank you for joining us.</p>
            </div>
        `;
        return await this.sendEmail({
            to: email,
            subject: "Welcome",
            html
        });
    }

    async sendPasswordResetEmail(email, resetLink) {

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
                <h2>Password Reset</h2>
                <p>Click the button below to reset your password.</p>
                <a
                    href="${resetLink}"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#000;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Reset Password
                </a>
                <p style="margin-top:20px;">
                    If you did not request this, please ignore this email.
                </p>
            </div>
        `;

        return await this.sendEmail({
            to: email,
            subject: "Password Reset",
            html
        });
    }

    async sendMembershipExpiryEmail({
        email,
        memberName,
        expiryDate
    }) {

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
                <h2>Membership Expiry Reminder</h2>

                <p>Hello ${memberName},</p>

                <p>
                    Your membership will expire on
                    <strong>${expiryDate}</strong>.
                </p>

                <p>
                    Please renew your membership to continue enjoying our services.
                </p>
            </div>
        `;

        return await this.sendEmail({
            to: email,
            subject: "Membership Expiry Reminder",
            html
        });
    }

    async sendInvoiceEmail({
        email,
        memberName,
        invoiceNumber,
        amount
    }) {

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
                <h2>Invoice Generated</h2>

                <p>Hello ${memberName},</p>

                <p>
                    Your invoice has been generated successfully.
                </p>

                <table
                    border="1"
                    cellpadding="10"
                    cellspacing="0"
                    style="border-collapse: collapse;"
                >
                    <tr>
                        <td>Invoice Number</td>
                        <td>${invoiceNumber}</td>
                    </tr>

                    <tr>
                        <td>Amount</td>
                        <td>₹${amount}</td>
                    </tr>
                </table>
            </div>
        `;

        return await this.sendEmail({
            to: email,
            subject: `Invoice ${invoiceNumber}`,
            html
        });
    }
}

const emailService = new EmailService();

module.exports = emailService;