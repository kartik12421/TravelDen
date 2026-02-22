const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../Schema.js");
const listing = require("../models/listing.js");
const review = require("../models/review.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//reviews route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const listingDoc = await listing.findById(req.params.id);
    const newReview = new review(req.body.review);

    listingDoc.reviews.push(newReview);

    await newReview.save();
    await listingDoc.save();

    req.flash("success", "New Review Created!");

    res.redirect(`/listings/${listingDoc._id}`);
  })
);

//delete review route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await review.findByIdAndDelete(reviewId);
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
