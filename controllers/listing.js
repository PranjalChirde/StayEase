const Listing = require("../models/listing.js");
const ExpressError = require('../utils/ExpressError.js');
const https = require('https');

// Geocode location using free OpenStreetMap Nominatim API
const geocode = (location, country) => {
    return new Promise((resolve) => {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'WanderlustApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (results.length > 0) {
                        resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
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
    // Geocode the location to get coordinates
    const coords = await geocode(req.body.listing.location, req.body.listing.country);
    if (coords) {
        newListing.coordinates = coords;
    }
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: "author"
            }
        }).populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.RenderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    let originalImageURL = listing.image && listing.image.url
        ? listing.image.url.replace("/upload", "/upload/w_250")
        : "";
    res.render("listings/edit.ejs", { listing, originalImageURL });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    // Re-geocode if location or country changed
    const coords = await geocode(req.body.listing.location, req.body.listing.country);
    if (coords) {
        listing.coordinates = coords;
    }
    await listing.save();
    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/listings");
};
