/** @format */
const nodemailer = require("nodemailer");
const config = require("../config");

// smtp is the main transport in nodemailer for delivering messages
// smtp is also the protocol used between almost all email hosts

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
            user: config.email.username,
            pass: config.email.password,
        },
        secure: false,
    });
    const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    strictTransportSecurity.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
};

module.exports = sendMail;
