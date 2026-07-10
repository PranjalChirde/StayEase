const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require('../utils/ExpressError.js');
const { ListingSchema, reviewSchema } = require('../schema.js');
const wrapAsync = require("../utils/wrapAsync.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login")
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    } next();
}

module.exports.isOwner = wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (!res.locals.curUser || !res.locals.curUser._id.equals(listing.owner._id)) {
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }
    // Check if current user is author
    if (!review.author.equals(res.locals.curUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
});

module.exports.validateListing = (req, res, next) => {
    let { error } = ListingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    };
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    };
};