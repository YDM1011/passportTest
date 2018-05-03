const mongoose = require('mongoose');
const multiparty = require('multiparty');
const fs = require('fs');
const md5 = require('md5');
const User = mongoose.model('user');
const Page = mongoose.model('page');
const data = require('../../config/index');
const mail = require('./mail');
const path = require('path');

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
module.exports.uploadFile = (req,res)=>{
    const form = new multiparty.Form();
    const uploadFile = {uploadPath: '', type: '', size: 0};
    const maxSize = 2 * 1024 * 1024; //2MB
    const supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    const errors = [];

    form.on('error', function(err){
        if(fs.existsSync(uploadFile.path)) {
            fs.unlinkSync(uploadFile.path);
            console.log('error');
        }
    });

    form.on('close', function() {
        if(errors.length == 0) {
            User
                .findById(req.session.passport.user._id)
                .select('-password')
                .exec(function (err, dataUser) {
                    if (err) send(res, 500, 'Something broke!');
                    if (!dataUser) send(res, 404, 'not find');
                    if (dataUser) {
                        fs.unlinkSync(dataUser.picture);
                        dataUser.picture = uploadFile.link;
                        dataUser.save(function(err) {
                            if(err) {
                                send(res, 404, {status: 'bad', errors: errors});
                            } else {
                                send(res, 200, {status: 'ok', text: dataUser.picture});
                            }
                        });
                    }
                });
        }
        else {
            if(fs.existsSync(uploadFile.path)) {
                fs.unlinkSync(uploadFile.path);
            }
            res.send({status: 'bad', errors: errors});
        }
    });

    // listen on part event for image file
    form.on('part', function(part) {
        const userSess = req.session.passport.user;
        uploadFile.size = part.byteCount;
        uploadFile.type = part.headers['content-type'];
        uploadFile.link = `https://filedn.com/lvu9CGHzYvAmwI1ArcH7sT0/${md5(userSess.createdOn)}id=${userSess._id}name=${part.filename}`;
        uploadFile.path = uploadFile.link;

        if(uploadFile.size > maxSize) {
            errors.push('File size is ' + uploadFile.size / 1024 / 1024 + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
        }

        if(supportMimeTypes.indexOf(uploadFile.type) == -1) {
            errors.push('Unsupported mimetype ' + uploadFile.type);
        }

        if(errors.length == 0) {
            var out = fs.createWriteStream(uploadFile.path);
            part.pipe(out);
        }
        else {
            part.resume();
        }
    });

    // parse the form
    form.parse(req);
}