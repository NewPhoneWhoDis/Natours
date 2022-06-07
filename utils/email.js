const nodemailer = require('nodemailer');
const { hmltToText } = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Testing Mail <${EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Send with Sendgrid
            return -1;
        } else {
            return nodemailer.createTransport({
                // In order for this to work with Gmail, activate 'less secure app' option in gmail
                // service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT
            })
        }
    }

    async send(template, subject) {
        const htmlMail = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            // TODO: add IMG uploads
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            html: htmlMail,
            text: hmltToText.fromString(htmlMail),
        }

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcomeEmail() {
        await this.send('welcome', 'Welcome to Natours!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token is valid for 10 minutes');
    }
}