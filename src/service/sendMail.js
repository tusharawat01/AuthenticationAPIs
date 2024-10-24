// using smtp from cpanel
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            // host: 'mail.aero2astro.com', 
            host: 'smtp.gmail.com', // SMTP server address
            port: 465, 
            secure: true, 
            auth: {
                user: process.env.MY_MAIL_ID , 
                pass: process.env.MY_MAIL_PASS   
            }
        });

        const mailOptions = {
            ...options
        };

  
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
    } catch (error) {
        console.error('Error in sending email: ', error);
    }
};

export default sendEmail;
