const mongoose = require('mongoose');
const data = require('../../config/index');
const dbURI = data.db;
mongoose.connect(dbURI, function (err, db) {
    var timer = setInterval(() => {
        db.collection('users').find({veryfi: false}).toArray(function(err, docs) {
            docs.forEach(function (item, i) {
                if (item.createdOn <= (new Date() - data.confirmTime)){
                    db.collection('users').remove(item);
                }
            })
        });
    }, 60000)
    timer.unref()
});


mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

process.on('SIGTERM', function() {
    gracefulShutdown('app shutdown', function() {
        process.exit(0);
    });
});

const gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

require('./page');
require('./user');
require('./section');