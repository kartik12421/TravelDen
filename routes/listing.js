const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLogedIn, isOwner, validatelisting } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingControler = require("../controler/listings.js");

//new route
router.get("/new", isLogedIn, listingControler.new);

router
  .route("/")
  .get(wrapAsync(listingControler.index)) //index route
  .post(isLogedIn, validatelisting, upload.single("listing[image]"), wrapAsync(listingControler.create)); //create new route

router
  .route("/:id")
  .get(wrapAsync(listingControler.show)) //show route
  .put(isLogedIn, upload.single("listing[image]"), validatelisting, isOwner, wrapAsync(listingControler.update)) //update route
  .delete(isLogedIn, isOwner, wrapAsync(listingControler.destroy)); //delete route

//edit route
router.get("/:id/edit", isLogedIn, isOwner, wrapAsync(listingControler.edit));

module.exports = router;
