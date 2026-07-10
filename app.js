if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
};

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError.js');
const { isLoggedIn, isOwner, validateListing, saveRedirectUrl, validateReview } = require("./middlewares/middleware.js");

// cookies required
const session = require("express-session");
const { MongoStore } = require('connect-mongo');
const flash = require("connect-flash");

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');

// access mongoDB - use local in dev, Atlas in production
const DB_URL = process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_ATLAS_URL
    : 'mongodb://127.0.0.1:27017/wanderlust';

const store = new MongoStore({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET || 'mysupersecretcode'
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Error in Session mongo store", err);
});

// cookies sessions options
const sessionOptions = {
    store,
    secret: process.env.SECRET || 'mysupersecretcode',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

// cookies 
app.use(session(sessionOptions));
app.use(flash());

// user authorization methods
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// success or error flash message middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    next();
});

// engines 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', require('@simonsmith/ejs-mate'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
    await mongoose.connect(DB_URL);
};

main()
    .then(() => {
        console.log("connected to db");
    }).catch((err) => {
        console.log(err);
    });

// Listings Routes
app.use('/listings', listingRouter);

// Reviews Routes
app.use('/listings/:id/reviews', reviewRouter);

// User Router
app.use("/", userRouter);

// 404 - All unmatched routes
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log(`server is running on http://localhost:8080/`);
});
