const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError.js');

const session = require("express-session");
const flash = require("connect-flash");

const listings = require('./routes/listing.js')
const reviews = require('./routes/reviews.js');

const sessionOptions = {
    secret: 'mysupersecretcode',
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', require('@simonsmith/ejs-mate'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "/public")));


// access mongoDB
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust'; 

async function main() {
    await mongoose.connect(MONGO_URL);
};

main()
    .then((res) => {
        console.log("connected to db")
    }).catch((err) => {
        console.log(err);
    });


app.get("/", (req, res) => {
    res.send("connected successfully");
});


// Listings Routes
app.use('/listings', listings);


// Reviews Routes
app.use('/listings/:id/reviews', reviews);


// All Routes
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "SomeThing Went Wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log(`server is running on http://localhost:8080/`);
});
