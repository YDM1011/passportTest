const mongoose = require('mongoose');
const Page = mongoose.model('page');

const errPage = res => {
    const err = new Error('ops, this page not found');
    err.status = 404;
    res.locals.message = err.message;
    res.locals.error = '';
    res.status(err.status);
    res.render('error');
}
module.exports.pageReadOne = (req, res, page) => {
    console.log('passport' in req.session);
    if(('passport' in req.session) || ('dataUser' in req.session)){
        if(page == "signin")
        return res.redirect("/profil");
        if(page == "signup")
        return res.redirect("/profil");
    }
    Page
        .findOne({pageName: page})
        .where('lan').equals(req.params.lan ? req.params.lan : "en")
        .exec(function(err, content) {
            if(!content) {
                errPage(res);
                return
            } else if(err) {
                res.status(500).send('Something broke!');
                return
            }
            let promise = new Promise((resolve, reject) => {
                require('./section')(req, page, resolve)
            });
            promise
                .then(
                    result => {
                        content.section = result;
                        content.page = content;
                        if ('passport' in req.session){
                            content.issession = true
                            content.session = req.session.passport.user;
                        }else{
                            content.issession = false
                        }
                        res.render(page, content)
                    },
                    error => {
                        console.log("Rejected: " + error.message);
                        res.status(500).send('Something broke!')
                    }
                );
        })

}
