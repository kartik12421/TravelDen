const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    category: Joi.string()
      .valid(
        "room",
        "iconic_cities",
        "mountains",
        "castles",
        "amazing_pools",
        "camping",
        "farms",
        "arctic",
        "other",
      )
      .required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.object({
      url: Joi.string().uri().allow("", null),
    }).optional().unknown(true),
  }).required().unknown(true),
}).unknown(true);

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required().unknown(true),
}).unknown(true);
