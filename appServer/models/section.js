const mongoose = require('mongoose');

const section = new mongoose.Schema({
    id: {type: String, required: true},
    title: {type: String, required: true},
    show: {type: Boolean, required: true},
    anchor: {
        name: {type: String, required: true},
        href: {type: String, required: true},
        putin: {type: [String], required: true},
        position: {type: Number, required: true}
    },
    forPage: {type: String, required: true},
    lan: {type: String, required: true},
    createdOn: {type: Date, "default": Date.now}
});
mongoose.model('section', section);