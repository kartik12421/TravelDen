const listing = require("../models/listing.js");
const review = require("../models/review.js");
const { destroy } = require("./listings.js");

module.exports.createReview = async (req, res) => {
  const listingDoc = await listing.findById(req.params.id);
  const newReview = new review(req.body.review);
  newReview.author = req.user._id;

  listingDoc.reviews.push(newReview);

  await newReview.save();
  await listingDoc.save();

  req.flash("success", "New Review Created!");

  res.redirect(`/listings/${listingDoc._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await review.findByIdAndDelete(reviewId);
  await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
};
