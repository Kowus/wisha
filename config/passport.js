var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function (passport) {
    passport.serializeUser(function (req, user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (req, id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        })
    });


    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'displayName', 'photos', 'email'],
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                if (!req.user) {
                    User.findOne({'fb_id': profile.id}, function (err, user) {
                        if (err) return done(err);
                        if (user) {
                            if (!user.fb_token) {
                                user.fb_token = token;
                                user.name = profile.displayName;
                                user.email = profile.emails[0].value;
                                user.profile_photo = profile.photos[0].value;

                                user.save(function (err) {
                                    if (err) throw err;
                                    return done(null, user);
                                });
                            }
                            return done(null, user);
                        }
                        else {
                            var newUser = new User();
                            newUser.fb_id = profile.id;
                            newUser.fb_token = token;
                            newUser.name = profile.displayName;
                            newUser.email = profile.emails[0].value;
                            newUser.profile_photo = profile.photos[0].value;

                            newUser.save(function (err) {
                                if(err) throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    var user = req.user;
                    user.fb_id = profile.id;
                    user.fb_token = token;
                    user.name = profile.displayName;
                    user.email = profile.emails[0].value;
                    user.profile_photo = profile.photos[0].value;

                    user.save(function (err) {
                        if (err) throw err;
                        return done(null, user);
                    });
                }

            });
        }));

};