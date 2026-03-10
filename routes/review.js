const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLogedIn,
  isReviewAuthoe,
} = require("../middleware.js");

const reviewController = require("../controler/reviews.js");

//reviews route
router.post(
  "/",
  isLogedIn,
  validateReview,
  wrapAsync(reviewController.createReview),
);

//delete review route
router.delete(
  "/:reviewId",
  isLogedIn,
  isReviewAuthoe,
  wrapAsync(reviewController.destroyReview),
);

module.exports = router;
