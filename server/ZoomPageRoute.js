const app = require('express').Router();


function isAuthorized(req, res, next) {
    if (req.user)
        next();
    else
        res.redirect('/auth');
}

app.use('/user', isAuthorized, require('./ZoomInterface'));
app.use('/user', isAuthorized, require('./OAuth/Signature'));
app.use('/auth', require('./OAuth/Authenticate'));

module.exports = app;