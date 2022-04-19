const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // Creates transporter
    const transporter = nodemailer.createTransport({
        // In order for this to work with Gmail, activate 'less secure app' option in gmail
        // service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT
    })

    // Defining email options
    const mailOptions = {
        from: 'Testing Mail <test@mail.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // Send email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;