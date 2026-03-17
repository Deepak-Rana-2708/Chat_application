const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
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
        return res.status(500).json({
            message: "Error sending email",
            success: false,
            error: error.message
        })
    }
}

module.exports = sendEmail;