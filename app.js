const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./Schema.js");
const review = require("./models/review.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderPlace");
}
main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

const validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.send("i am groot");
});

//index route
app.get("/listings", async (req, res) => {
  const allListings = await listing.find();
  res.render("./listings/index.ejs", { allListings });
});

//new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listingId = await listing.findById(id).populate("reviews");
  res.render("./listings/show.ejs", { listingId });
});

//create new route
app.post(
  "/listings",
  validatelisting,
  wrapAsync(async (req, res, next) => {
    // let {title, description, image, price, location, country} = req.body;
    // let newlisting = req.body.listing;

    let newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//edit route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listingId = await listing.findById(id);
  res.render("listings/edit.ejs", { listingId });
});

//update route
app.put("/listings/:id", validatelisting, async (req, res) => {
  let { id } = req.params;
  await listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
});

//delete routre
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

//reviews route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const listingDoc = await listing.findById(req.params.id);
    const newReview = new review(req.body.review);

    listingDoc.reviews.push(newReview);

    await newReview.save();
    await listingDoc.save();

    res.redirect(`/listings/${listingDoc._id}`);
  })
);

//delete review route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

//err
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).send(message);
});

//listening route
app.listen(3000, () => {
  console.log("server is listening at port 3000");
});
