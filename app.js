const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require('path');
const methodOverride = require('method-override');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require('./utils/ExpressError.js');
const { ListingSchema } = require('./schema.js');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', require('@simonsmith/ejs-mate'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust'; 

async function main() {
    await mongoose.connect(MONGO_URL)
};

main()
    .then((res) => {
        console.log("connected to db")
    }).catch((err) => {
        console.log(err);
    })


app.get("/", (req, res) => {
    res.send("connected successfully");
});

const validateListing = (req, res, next) => {
    let { error } = ListingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})); 

//new route
app.get("/listings/new" , (req, res) => {
    res.render("listings/new.ejs")
});

//create route
app.post("/listings", validateListing,
     wrapAsync( async (req, res) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

// show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/show.ejs" , { listing })
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/edit.ejs", {listing})
}));

//update route
app.put("/listings/:id", validateListing,
    wrapAsync( async (req, res) => {
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing}, { runValidators: true });
        res.redirect(`/listings/${id}`);
    })
);

//delete route
app.delete("/listings/:id",
    wrapAsync( async (req, res) => {
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        res.redirect("/listings")
    })
);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
})

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "SomeThing Went Wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
})

app.listen(8080, () => {
    console.log(`server is running on http://localhost:8080/`);
});