require('dotenv/config')
const ZoomStrategy = require('@giorgosavgeris/passport-zoom-oauth2').Strategy;
const passport = require('passport');
const UserModel = require('../Models/UserModel');

passport.serializeUser((user, done) => {
    // console.log("user saved");
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    if (user) {
        // console.log("user unsaved");
        done(null, user);
    }
})

passport.use(new ZoomStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: process.env.REDIRECTURL
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            const user = await UserModel.findOne({ zoomid: profile.id });
            if (user) {
                user.refreshToken = refreshToken;
                await user.save();
                done(null, user)
            }
            else {
                const NewUser = new UserModel({
                    zoomid: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    refreshToken: refreshToken,
                    picUrl: profile._json.pic_url,
                    timeZone: profile._json.timezone
                });
                console.log(NewUser);
                const SavedUser = await NewUser.save();
                done(null, SavedUser);
            }
        } catch (err) {
            done(err, null)
        }
    }
));