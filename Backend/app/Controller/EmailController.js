const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            requireTLS: true,
            logger: true,
            debug: true,
            auth: {
                user: process.env.Email,
                pass: process.env.Email_Password
            }
        });
        try { 
            const mailOptions = {
            from: `"MicroTech" <${process.env.Email}>`,
            to: to,
            subject: subject,
            html: message
            }
            await transporter.sendMail(mailOptions);
            console.warn("Email sent successfully");
        } catch (error) {
            throw new Error("Error creating email options: " + error.message);
        }

    } catch (error) {
       throw new Error("Email sending failed: " + error.message);
    }
}

module.exports = sendEmail;