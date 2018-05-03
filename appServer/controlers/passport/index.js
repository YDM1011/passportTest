const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('user');
const data = require('../../../config');

module.exports = (app , passport) => {

    app.use(passport.initialize());
    app.use(passport.session());

    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const storedb = new MongoStore({
        url: data.session.url,
        touchAfter: data.session.touchAfter
    });
    if (app.get('env') === 'production') {
        app.set('trust proxy', 1) // trust first proxy
        app.use(session({
            secret: data.session.secret,
            resave: data.session.resave,
            saveUninitialized: data.session.saveUninitialized,
            cookie: data.session.cookieSave,
            rolling: data.session.rolling,
            store: storedb
        }));
    }else{
        app.use(session({
            secret: data.session.secret,
            resave: data.session.resave,
            saveUninitialized: data.session.saveUninitialized,
            cookie: data.session.cookie,
            rolling: data.session.rolling,
            store: storedb
        }));
    }
    // session.Store.super_.EventEmiter.on("timeout", function (s) {
    //     console.log("ok timeout");
    // })

    storedb.on("destroy", function (s) {
        console.log("destroy ok", s);
    });
   //  let evants = require("events");
   //  let em = new session.Store.super_.EventEmitter();
   //  em.once('newListener', (event, listener) => {
   //      if (event === 'event') {
   //          // Insert a new listener in front
   //          em.on('event', () => {
   //              console.log('B');
   //          });
   //      }
   //  });
   //  em.on('event', () => {
   //      console.log('A');
   //  });
   // console.log(new MongoStore({
   //     url: data.session.url,
   //     touchAfter: data.session.touchAfter
   // }));
   //  em.emit('event');

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((email, done) => {
        User.findOne({email: email}, (err, user) => {
            done(err, user);
        });
    });
    const errPage = res => {
        const err = new Error('ops, this page not found');
        err.status = 404;
        res.locals.message = err.message;
        res.locals.error = '';
        res.status(err.status);
        res.render('error');
    }
    passport.use(new FacebookStrategy(data.facebook,
        (accessToken, refreshToken, profile, done) => {
            User.findOne({email: profile._json.email}, (err, user) => {
                if (err) { return done(err); }
                if (user) {
                    user.email = profile._json.email;
                    user.name = profile._json.name;
                    user.fslink = profile._json.link;
                    // user.picture = `https://graph.facebook.com/${profile._json.id}/picture?width=360`;
                    user.save(function(err) {
                        if(err) {
                            done(err);
                        } else {
                            done(null, user);
                        }
                    });
                }
                if (!user) {
                    User.create({
                        email: profile._json.email,
                        name: profile._json.name,
                        picture: `https://graph.facebook.com/${profile._json.id}/picture?width=360`,
                        fslink: profile._json.link,
                        veryfi: true
                    }, (err, user) => {
                        if(err) {
                            done(err);
                        } else {
                            done(null, user);
                        }
                    });
                }
            });
        }
    ));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { successRedirect: data.auth.successRedirect,
                                            failureRedirect: data.auth.failureRedirect })
    );
    app.post('/hash', (req, res) =>{
        res.json(JSON.stringify({id: `./profil/${req.session.passport.user._id}`}));
    });

    app.get('/auth/facebook',
        passport.authenticate('facebook', { scope: 'email' })
    );

    return passport;
}