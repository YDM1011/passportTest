const mongoose = require('mongoose');
const ejs = require('ejs');
const fs = require('fs');
const md5 = require('md5');
const User = mongoose.model('user');
const Page = mongoose.model('page');
const data = require('../../config/index');
const mail = require('./mail');

const errPage = res => {
    const err = new Error('ops, this page not found');
    err.status = 404;
    res.locals.message = err.message;
    res.locals.error = '';
    res.status(err.status);
    res.render('error');
}
function send(res, status, mes){
    res.status(status);
    res.json(mes);
}
module.exports.nameChange = (req,res)=>{
    const dataPost = req.body;
    console.log(dataPost);

    User
        .findById(req.session.passport.user._id)
        .select('-password')
        .exec(function (err, dataUser) {
            if (err) send(res, 500, 'Something broke!');
            if (!dataUser) send(res, 404, 'not find');
            if (dataUser) {
                dataUser.name = dataPost.name;
                dataUser.save(function(err) {
                    if(err) {
                        send(res, 404, err);
                    } else {
                        send(res, 200, dataPost.name);
                    }
                });
            }
        });
};

module.exports.emailChange = (req,res)=>{
    const dataPost = req.body;
    const thisUser = req.session.passport.user;
    User.findOne({email: dataPost.email}).exec(function(err, content){
        if(err) res.status(500).send('Something broke!');
        if(content) send(res, 200, 'email is in use');
        if(!content){
            if ('passport' in req.session){
                const keyConfirm = `${data.email.link4}${md5(thisUser.email+"emailsicret")}/${dataPost.email.replace(/<\/?[^>]+>/g,'')}`;
                mail.send({
                    // mail: thisUser.email.replace(/<\/?[^>]+>/g,''), //send on old
                    mail: dataPost.email.replace(/<\/?[^>]+>/g,''), //send on new
                    keyConfirm: keyConfirm,
                    // temp: 'appServer/views/mail/e-mail.ejs',
                    subject: data.email.subject,
                    message: data.email.message
                });
                send(res, 200, 'all is ok');
            }else{
                res.redirect(`/signin`)
            }
        }
    });
};

module.exports.emailChangeConfirm = (req,res)=>{
    const thisUser = req.session.passport.user;

    User
        .findById(thisUser._id)
        .exec(function (err, dataUser) {
            if (err) send(res, 500, 'Something broke!');
            if (!dataUser) send(res, 404, 'not find');
            if (dataUser && (req.params.oldmail == md5(thisUser.email+"emailsicret"))) {
                dataUser.email = req.params.email;
                // dataUser.verify = false;
                dataUser.save(function(err) {
                    if(err) {
                        send(res, 404, err);
                    } else {
                        res.redirect(`/profil/${thisUser._id}`)
                    }
                });
            }
        });
};

module.exports.pswChange = (req,res)=>{
    const thisUser = req.session.passport.user;
    const dataPost = req.body;
    User
        .findById(thisUser._id)
        .exec(function (err, dataUser) {
            if (err) send(res, 500, 'Something broke!');
            if (!dataUser) send(res, 404, 'not find');

            if (dataUser ){
                if ((dataPost.psw3 == dataPost.psw2) && (dataPost.psw1 == dataUser.password)) {
                    dataUser.password = dataPost.psw3;
                    // dataUser.verify = false;
                    dataUser.save(function(err) {
                        if(err) {
                            send(res, 404, err);
                        } else {
                            send(res, 200, 'all is ok');
                        }
                    });
                }else{
                    send(res, 200, 'error password');
                }
            }
        });
};