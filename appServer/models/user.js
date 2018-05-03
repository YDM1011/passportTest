const mongoose = require('mongoose');
const user = new mongoose.Schema({
    email: String,
    password: {type: String, required: false},
    veryfi: {type: Boolean, required: true},
    createdOn: {type: Date, "default": Date.now},
    name: {type: String, required: false},
    picture: {type: String, required: false},
    fslink: {type: String, required: false},
});
mongoose.model('user', user);