const mongoose = require("mongoose");

let reviewSchema = new mongoose.Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdat: {
    type: Date,
    default: Date.now(),
  },
});

let review = mongoose.model("Review", reviewSchema);

module.exports = review;
