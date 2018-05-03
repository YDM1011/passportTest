const mongoose = require('mongoose');

const openingTimeSchema = new mongoose.Schema({
    days: {type: String, required: true},
    opening: String,
    closing: String,
    closed: {type: Boolean, required: true}
});

const reviewSchema = new mongoose.Schema({
    author: String,
    rating: {type: Number, required: true, min: 0, max: 5},
    reviewText: String,
    createdOn: {type: Date, "default": Date.now}
});

const pages = new mongoose.Schema({
    pageName: String,
    name: String,
    title: String,
    lan: String
});

mongoose.model('page', pages)