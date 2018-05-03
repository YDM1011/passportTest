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

module.exports.userConfirm = (req, res)=>{
    const rb = req.body;
    if (rb.email && rb.login && rb.password && rb.rools){
        User
        .findOne({email: rb.email.replace(/<\/?[^>]+>/g,'')})
        .exec(function(err, content) {
            if(err) res.status(500).send('Something broke!');
            if(!content){
                User.create(
                {
                    email: rb.email.replace(/<\/?[^>]+>/g,''),
                    name: rb.login.replace(/<\/?[^>]+>/g,''),
                    password: rb.password.replace(/<\/?[^>]+>/g,''),
                    veryfi: false
                },
                function(err, user) {
                    if(err) errPage(res);
                    if(!err){
                        const keyConfirm = `${data.email.link2}${user.email}/${md5(user._id+user.password)}`;
                        mail.send({
                            mail: rb.email.replace(/<\/?[^>]+>/g,''),
                            keyConfirm: keyConfirm,
                            // temp: 'appServer/views/mail/e-mail.ejs',
                            subject: data.email.subject,
                            message: data.email.message
                        });
                        User
                        .findOne({email: rb.email.replace(/<\/?[^>]+>/g,'')})
                        .exec(function(err, content) {
                            if(err) {
                                console.log(err);
                                res.status(500).send('Something broke!');
                                return
                            }
                            if(!content){
                                res.redirect('/signup');
                            }
                            if(content) {
                                if (content.password == req.body.password.replace(/<\/?[^>]+>/g,'')){
                                    req.session.cookie.maxAge = data.confirmTime;
                                    req.session.passport = {"user":content};
                                    res.redirect(`/profil/${content._id}`);
                                    return
                                }else{
                                    res.redirect('/signin');
                                }
                            }
                        });
                    }
                });
            }
            if(content) res.redirect('/signin');
        });
    }else{
        res.redirect('/signup');
    }
}

module.exports.userCreate = (req, res)=> {
        User
        .findOne({email: req.params.email})
        .exec(function(err, content) {
            if(err) res.status(500).send('Something broke!');
            if(!content) res.status(500).send('Something broke!');
            if(content) {
                if (req.params.id == md5(content._id+content.password)){
                    content.veryfi = true;
                    content.save(function(err, content) {
                        if(err) {
                            errPage(res);
                            return;
                        } else {
                            res.redirect(`/profil/${content._id}`);
                        }
                    });
                }else{
                    res.redirect("/");
                }
            }
        });
}

module.exports.userResetPas = (req, res)=> {
        User
        .findOne({email: req.params.email})
        .exec(function(err, content) {
            if(err) res.status(500).send('Something broke!');
            if(!content) res.status(500).send('Something broke!');
            if(content) {
                if (req.params.psw == md5(content.password)){
                    req.session.passport = {"user": content};
                    res.redirect(`/profil/${content._id}/#upgradePassword`);
                }else{
                    res.redirect("/");
                }
            }

        });
}

module.exports.userForgot = (req,res)=>{
    const rb = req.body;
    if (rb.emailforgot){
        User
        .findOne({email: rb.emailforgot.replace(/<\/?[^>]+>/g,'')})
        .exec(function(err, content) {
            if(err) res.status(500).send('Something broke!');
            if(!content) res.redirect('/signin');
            if(content){
                const keyConfirm = `${data.email.link3}${rb.emailforgot.replace(/<\/?[^>]+>/g,'')}/${md5(content.password)}`;
                mail.send({
                    mail: rb.email.replace(/<\/?[^>]+>/g,''),
                    keyConfirm: keyConfirm,
                    // temp: 'appServer/views/mail/e-mail.ejs',
                    subject: data.email.subject,
                    message: data.email.message
                });
                res.redirect(`/signin/#forgot=${rb.emailforgot.replace(/<\/?[^>]+>/g,'')}`);
            }
        });
    }else{
        res.redirect('/signup');
    }
}

module.exports.pageReadUser = (req, res, page) => {
    Page
    .findOne({pageName: page})
    .where('lan').equals('en')//from thetings user
    .exec(function(err, content) {
        if(err) res.status(500).send('Something broke!');
        if(!content) errPage(res);
        if (req.params.id){
            if ('passport' in req.session) {
                if (req.session.passport.user._id == req.params.id) {
                    res.redirect(`/profil/${req.params.id}`)
                }
            }
            User
                .findById(req.params.id)
                .select('-password')
                .exec(function (err, dataUser) {
                    if (err) res.status(500).send('Something broke!');
                    if (!dataUser) errPage(res);
                    if (dataUser) {
                        content.page = content;
                        content.dataUser = dataUser;
                        if ('passport' in req.session){
                            content.issession = true
                            content.session = req.session.passport.user;
                        }else{
                            content.issession = false
                        }
                        res.render(page, content)
                    }
                });
        }
    })
}

module.exports.pageReadUsers = (req, res, page) => {
    Page
        .findOne({pageName: page})
        .where('lan').equals(req.params.lan ? req.params.lan : "en")
        .exec(function(err, content) {
            if(err) res.status(500).send('Something broke!');
            if(!content) errPage(res);
            User
                .find({})
                .select('-password')
                .exec(function (err, dataUser) {
                    if (err) res.status(500).send('Something broke!');
                    if (!dataUser) errPage(res);
                    if (dataUser) {

                        content.page = content;
                        if (('passport' in req.session)){
                            content.issession = true;
                            content.session = req.session.passport.user;
                            content.dataUser = getUser(req, dataUser);
                        }else{
                            content.issession = false;
                            content.dataUser = dataUser;
                        }
                        res.render(page, content)
                    }
                });
        })
}

module.exports.pageReadProfil = (req, res, page) => {
    if ('passport' in req.session){
        if (req.session.passport.user._id != req.params.id){
            res.redirect(`/user/${req.params.id}`)
        }else{
            Page
                .findOne({pageName: page})
                .where('lan').equals('en')//from thetings user
                .exec(function(err, content) {
                    if(err) res.status(500).send('Something broke!');
                    if(!content) errPage(res);
                    if ('passport' in req.session) {
                        User
                            .findById(req.session.passport.user._id)
                            .select('-password')
                            .exec(function (err, dataUser) {
                                if (err) res.status(500).send('Something broke!');
                                if (!dataUser) errPage(res);
                                if (dataUser) {
                                    content.page = content;
                                    content.section = false;
                                    content.dataUser = dataUser;
                                    content.issession = true;
                                    content.session = req.session.passport.user;
                                    res.render(page, content)
                                }
                            });
                    }else{
                        res.redirect("/signin")
                    }
                })
        }
    }else{
        res.redirect(`/user/${req.params.id}`)
    }

}

module.exports.userLogin = function(req, res){
    const mail = req.body.email.replace(/<\/?[^>]+>/g,'');
    const password = req.body.password.replace(/<\/?[^>]+>/g,'');
    if ((mail != '') && password ){
        User
            .findOne({email: mail})
            .exec(function(err, content) {
                if(err) res.status(500).send('Something broke!');
                if(!content) res.redirect('/signin');
                if(content) {
                    if (content.password == password){
                        req.session.passport = {"user":content};
                        res.redirect(`/profil/${content._id}`);
                    }else{
                        res.redirect('/signin');
                    }
                }
            });
    }else{
        res.redirect('/signin');
    }

}

module.exports.userLogout = function(req, res){
    req.session.destroy();
    res.redirect("signin");
}

function getUser(req, dataUser){
    dataUser.forEach(function (item, i) {
        if (item._id == req.session.passport.user._id){
            dataUser.splice(i,1);
        }
    })
    return dataUser;
}