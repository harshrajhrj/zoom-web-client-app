const connectionDB = require('./mongodb-connect');
connectionDB();
const mongoose = require("mongoose");
const express = require('express');
const session = require('express-session');
const Mongostore = require('connect-mongo');
const passport = require('passport');
const zoomStrategy = require('./server/OAuth/ZoomAuth');
const path = require('path');
const flash = require('connect-flash');
const app = express();
const cors = require('cors')
require('dotenv').config();

// middleware to convert all data incoming and outgoing into JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors())

// session storage
app.use(session({
    secret: 'some random secret',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    name: 'zoom_session',
    resave: false,
    store: Mongostore.create({
        mongoUrl: process.env.CONNECTION,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    })
}))

// storing flash in sessions
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// passport sessions
app.use(passport.initialize());
app.use(passport.session());

// ejs set engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const user = req.user;
    res.render('ZoomRecorder.ejs', { user, type: 'landing' });
})

app.use('/', require('./server/ZoomPageRoute'));

app.listen(process.env.PORT || 3000, () => console.log("Listening on port 3000"));