const validCampgroundSchema = require("../validationSchemas/validCampground");
const validReviewSchema = require("../validationSchemas/validReviewSchema");
const ExpressError = require("../utils/ExpressError");
const zod = require("zod");

async function campgroundValidate(req, res, next) {
  if (!req.body.campground.reviews) req.body.campground.reviews = [];
  const { success, error } = validCampgroundSchema.safeParse(req.body);
  if (success) next();
  else {
    const message = error.errors.map((err) => err.message).join(", ");
    next(new ExpressError(message, 400));
  }
}

async function reviewValidate(req, res, next) {
  const { success, error } = validReviewSchema.safeParse(req.body);
  if (success) next();
  else {
    console.log(error);
    const message = error.errors.map((err) => err.message).join(", ");
    next(new ExpressError(message, 400));
  }
}

module.exports = { campgroundValidate, reviewValidate };
