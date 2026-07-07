const Listing = require("../models/listing.js");
const ExpressError = require('../utils/ExpressError.js')


module.exports.index = async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", {allListings});
    };

module.exports.renderNewForm = (req, res) => {
        res.render("listings/new.ejs");
    };

module.exports.createListing = async (req, res) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    };

module.exports.showListing = async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate(
                { 
                    path :'reviews',
                    populate : {
                        path : "author"
                    }
                }
            ).populate("owner")


        if (!listing) {
            throw new ExpressError(404, "Listing Not Found");
        }
        res.render("listings/show.ejs" , { listing });
    };

module.exports.RenderEditForm = async (req, res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing Not Found");
        }
        let originalImageURL = listing.image.url;
        originalImageURL.replace("/upload", "/upload/w_250")
        res.render("listings/edit.ejs", {listing, originalImageURL});
    };

module.exports.updateListing = async (req, res) => {
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, { runValidators: true, new: true });
        if (typeof req.file !== "undefined") {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            }
            await listing.save();
        }
        req.flash("success", "Listing Updated Successfully");
        res.redirect(`/listings/${id}`);
    };

module.exports.deleteListing = async (req, res) => {
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted Successfully");
        res.redirect("/listings");
    };