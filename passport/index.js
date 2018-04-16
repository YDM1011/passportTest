const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
module.exports = (app , passport) => {

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
            clientID: '1644388132319517',
            clientSecret: '4c5e3bdc2353eebf82cb743aa5e71b59',
            callbackURL: "https://rocky-everglades-11458.herokuapp.com/auth/facebook/callback"
        },
        function(accessToken, refreshToken, profile, done) {
        console.log(profile);
            // User.findOrCreate(..., function(err, user) {
            //     if (err) { return done(err); }
            //     done(null, user);
            // });
            done(null, profile);
        }
    ));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { successRedirect: '/',
            failureRedirect: '/login' }));

    app.get('/auth/facebook',
        passport.authenticate('facebook', { scope: 'read_stream' })
    );

    return passport;
}