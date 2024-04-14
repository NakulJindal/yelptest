const validCampgroundSchema = require("../validationSchemas/validCampground");
const validReviewSchema = require("../validationSchemas/validReviewSchema");
const ExpressError = require("../utils/ExpressError");
const zod = require("zod");

async function campgroundValidate(req, res, next) {
  if (!req.body.campground.reviews) req.body.campground.reviews = [];
  const sanitizedCamp = validCampgroundSchema.safeParse(req.body);
  const { title, location, description } = sanitizedCamp.data.campground;
  if (sanitizedCamp.success) {
    if (
      title.length === 0 ||
      location.lenght === 0 ||
      description.lenght === 0
    ) {
      next(new ExpressError("Cannot include HTML in inputs", 400));
    }
    next();
  } else {
    const message = error.errors.map((err) => err.message).join(", ");
    next(new ExpressError(message, 400));
  }
}

async function reviewValidate(req, res, next) {
  const sanitizedReview = validReviewSchema.safeParse(req.body);
  const { comment } = sanitizedReview.data.reviews;
  if (sanitizedReview.success) {
    if (comment.length === 0) {
      next(new ExpressError("Cannot include HTML in a Review", 400));
    }
    next();
  } else {
    console.log(error);
    const message = error.errors.map((err) => err.message).join(", ");
    next(new ExpressError(message, 400));
  }
}

module.exports = { campgroundValidate, reviewValidate };
