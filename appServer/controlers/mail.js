const data = require('../../config/index');
const ejs = require('ejs');
const fs = require('fs');
module.exports.send = (ob) => {
    const obj = ob;
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport(
        {
            host: data.email.host,
            port: data.email.port,
            secure: data.email.secure,
            auth: {
                user: data.email.user,
                pass: data.email.pass
            }
        });

    console.log((data.email.link1 + obj.keyConfirm));
    const contentMail ={
        message: obj.message ? obj.message : data.email.message,
        link: String(data.email.link1 + obj.keyConfirm)
    }
    transporter.sendMail({
        from: data.email.user,
        to: obj.mail,
        subject: obj.subject, //data.email.subject,
        html: ejs.render( fs.readFileSync(obj.temp ? obj.temp : 'appServer/views/mail/e-mail.ejs', 'utf-8') , contentMail)
    }, (err, info) => {
        if (err) {
            return console.log(err);
        }
        console.log(`Message ${info.messageId} send: ${info.response}`);
    });
}