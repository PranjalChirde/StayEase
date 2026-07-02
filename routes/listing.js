const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const { ListingSchema } = require('../schema.js');


const validateListing = (req, res, next) => {
    let { error } = ListingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    };
};


//index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})); 

//new route
router.get("/new" , (req, res) => {
    res.render("listings/new.ejs");
});

//create route
router.post("/", validateListing, wrapAsync( async (req, res) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing Created")
        res.redirect("/listings");
    })
);

// show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/show.ejs" , { listing });
    })
);

//edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/edit.ejs", {listing});
}));

//update route
router.put("/:id", validateListing,
    wrapAsync( async (req, res) => {
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing}, { runValidators: true });
        req.flash("success", "Listing Updated Successfully");
        res.redirect(`/listings/${id}`);
    })
);

//delete route
router.delete("/:id",
    wrapAsync( async (req, res) => {
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted Successfully");
        res.redirect("/listings");
    })
);

module.exports = router;