const express = require('express');
const passport = require('passport');
const app = express.Router();

app.get('/', passport.authenticate('zoom'));
app.get('/redirect', passport.authenticate('zoom', {
    failureRedirect: '/forbidden',
    successRedirect: '/'
}));

app.get('/forbidden', (req, res) => {
    res.send('Sorry, unable to authenticate!');
})

app.get('/logout', (req, res, next) => {
    if (req.user) {
        req.logout(function (err) {
            if (err) { return next(err); }
            res.redirect('/');
        })
    } else
        res.redirect('/');
})

module.exports = app;