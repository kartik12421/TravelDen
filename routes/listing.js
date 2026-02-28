const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const { isLogedIn, isOwner, validatelisting } = require("../middleware.js");

//index route
router.get("/", async (req, res) => {
  const allListings = await listing.find();
  res.render("./listings/index.ejs", { allListings });
});

//new route
router.get("/new", isLogedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listingId = await listing
      .findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    console.log(listingId);
    if (!listingId) {
      req.flash("error", "Listing doesn't exist");
      return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listingId });
  }),
);

//create new route
router.post(
  "/",
  isLogedIn,
  validatelisting,
  wrapAsync(async (req, res, next) => {
    let newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  }),
);

//edit route
router.get(
  "/:id/edit",
  isLogedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listingId = await listing.findById(id);
    res.render("listings/edit.ejs", { listingId });
  }),
);

//update route
router.put(
  "/:id",
  isLogedIn,
  validatelisting,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
  }),
);

//delete routre
router.delete(
  "/:id",
  isLogedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
