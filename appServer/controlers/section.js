const mongoose = require('mongoose');
const Section = mongoose.model('section');

module.exports = (req, page, resolve)=>{
    Section
    .find({forPage: page})
    .where('lan').equals(req.params.lan ? req.params.lan : "en")
    .exec(function(err, content) {
        if(content.length == 0) {
            resolve({
                bild: false
            });
        } else if(err) {
            res.status(500).send('Something broke!');
            return
        }
        if(content.length != 0) {
            resolve({
                bild: true,
                data: content
            })
        }
    })
};