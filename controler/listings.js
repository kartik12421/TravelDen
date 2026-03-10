const listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports.index = async (req, res) => {
  const searchQuery = (req.query.search || "").trim();
  const locationQuery = (req.query.location || "").trim();
  const countryQuery = (req.query.country || "").trim();
  const categoryQuery = (req.query.category || "").trim().toLowerCase();
  let allListings;
  const filters = [];
  const categoryKeywordMap = {
    room: /(room|suite|apartment|studio|hostel)/i,
    iconic_cities:
      /(city|downtown|urban|metropolitan|new york|london|paris|mumbai|delhi|tokyo)/i,
    mountains: /(mountain|hill|alps|himalaya|peak|valley|cliff)/i,
    castles: /(castle|fort|palace|manor|heritage)/i,
    amazing_pools: /(pool|swim|waterfront|lagoon|hot tub)/i,
    camping: /(camp|tent|glamp|caravan|outdoor)/i,
    farms: /(farm|barn|ranch|countryside|orchard)/i,
    arctic: /(arctic|snow|ice|igloo|ski|winter|glacier)/i,
  };

  if (searchQuery) {
    const safeQuery = escapeRegex(searchQuery);
    filters.push({
      $or: [
        { title: { $regex: safeQuery, $options: "i" } },
        { location: { $regex: safeQuery, $options: "i" } },
        { country: { $regex: safeQuery, $options: "i" } },
      ],
    });
  }

  if (locationQuery) {
    const safeLocation = escapeRegex(locationQuery);
    filters.push({ location: { $regex: safeLocation, $options: "i" } });
  }

  if (countryQuery) {
    const safeCountry = escapeRegex(countryQuery);
    filters.push({ country: { $regex: safeCountry, $options: "i" } });
  }

  if (categoryQuery && categoryQuery !== "trending") {
    if (categoryQuery === "other") {
      const categoryRegexes = Object.values(categoryKeywordMap);
      filters.push({
        $or: [
          { category: "other" },
          {
            $and: [
              { category: { $exists: false } },
              {
                $nor: categoryRegexes.map((regex) => ({
                  $or: [
                    { title: regex },
                    { description: regex },
                    { location: regex },
                    { country: regex },
                  ],
                })),
              },
            ],
          },
        ],
      });
    } else if (categoryKeywordMap[categoryQuery]) {
      const categoryRegex = categoryKeywordMap[categoryQuery];
      filters.push({
        $or: [
          { category: categoryQuery },
          {
            $and: [
              { category: { $exists: false } },
              {
                $or: [
                  { title: categoryRegex },
                  { description: categoryRegex },
                  { location: categoryRegex },
                  { country: categoryRegex },
                ],
              },
            ],
          },
        ],
      });
    }
  }

  if (filters.length > 0) {
    allListings = await listing.find({ $and: filters });
  } else {
    allListings = await listing.find();
  }

  res.render("./listings/index.ejs", {
    allListings,
    searchQuery,
    locationQuery,
    countryQuery,
    categoryQuery,
  });
};

module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.show = async (req, res) => {
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
  if (!listingId) {
    req.flash("error", "Listing doesn't exist");
    return res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listingId });
};

module.exports.create = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  let newListing = new listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listingId = await listing.findById(id);
  if (!listingId) {
    req.flash("error", "Listing you requested, doesn't exists");
    res.redirect("/listings");
  }

  let originaImageUrl = listingId.image.url;
  originaImageUrl = originaImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listingId, originaImageUrl });
};

module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listingDoc = await listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true },
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listingDoc.image = { url, filename };
    await listingDoc.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await listing.findByIdAndDelete(id);

  if (deletedListing?.image?.filename) {
    await cloudinary.uploader.destroy(deletedListing.image.filename);
  }

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
