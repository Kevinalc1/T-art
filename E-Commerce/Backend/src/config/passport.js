const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

// Google Strategy - Only initialize if credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    console.error('❌ Google login failed: No email provided');
                    return done(new Error('Email não fornecido pelo Google'), null);
                }

                // Check if user exists with googleId
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    console.log(`✓ User logged in with Google: ${email}`);
                    return done(null, user);
                }

                // Check if user exists with same email (account linking)
                user = await User.findOne({ email: email });
                if (user) {
                    const previousProviders = [];
                    if (user.facebookId) previousProviders.push('Facebook');

                    user.googleId = profile.id;
                    await user.save();

                    console.log(`🔗 Linked Google account to existing user: ${email}${previousProviders.length > 0 ? ` (previously had: ${previousProviders.join(', ')})` : ''}`);
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    email: email,
                    isAdmin: false
                });
                console.log(`✨ New user created with Google: ${email}`);
                done(null, user);
            } catch (err) {
                console.error('❌ Google OAuth error:', err.message);
                done(err, null);
            }
        }
    ));
    console.log('✓ Google OAuth strategy initialized');
} else {
    console.log('⚠ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

// Facebook Strategy - Only initialize if credentials are present
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

                // Check if user exists with facebookId
                let user = await User.findOne({ facebookId: profile.id });
                if (user) {
                    console.log(`✓ User logged in with Facebook: ${email || profile.id}`);
                    return done(null, user);
                }

                // Check if user exists with same email (account linking)
                if (email) {
                    user = await User.findOne({ email: email });
                    if (user) {
                        const previousProviders = [];
                        if (user.googleId) previousProviders.push('Google');

                        user.facebookId = profile.id;
                        await user.save();

                        console.log(`🔗 Linked Facebook account to existing user: ${email}${previousProviders.length > 0 ? ` (previously had: ${previousProviders.join(', ')})` : ''}`);
                        return done(null, user);
                    }
                }

                // Create new user
                const userEmail = email || `facebook_${profile.id}@example.com`;
                user = await User.create({
                    facebookId: profile.id,
                    email: userEmail,
                    isAdmin: false
                });

                if (!email) {
                    console.log(`⚠️ New user created with Facebook (no email provided): ${userEmail}`);
                } else {
                    console.log(`✨ New user created with Facebook: ${email}`);
                }

                done(null, user);
            } catch (err) {
                console.error('❌ Facebook OAuth error:', err.message);
                done(err, null);
            }
        }
    ));
    console.log('✓ Facebook OAuth strategy initialized');
} else {
    console.log('⚠ Facebook OAuth not configured (missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET)');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
