const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const {  validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares/middleware.js");



// Post review route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review Added Successfully");
    res.redirect(`/listings/${listing._id}`);
    })
);

//delete review route
router.delete("/:reviewId" ,isLoggedIn, isReviewAuthor, wrapAsync(async(req, res, next)=> {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review Deleted Successfully");
     res.redirect(`/listings/${id}`);
    })
);

module.exports = router;

