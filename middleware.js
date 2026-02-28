const listing = require("./models/listing");
const review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./Schema.js");

module.exports.isLogedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirect to original path
    req.session.originalUrl = req.originalUrl;
    //-------------------------

    req.flash("error", "You must log in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.redirectUrl = (req, res, next) => {
  if (req.session.originalUrl) {
    res.locals.originalUrl = req.session.originalUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listings = await listing.findById(id);
  if (!listings.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing...");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthoe = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let reviews = await review.findById(reviewId);
  if (!reviews.author.equals(req.user._id)) {
    req.flash("error", "You didn't create this review...");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
