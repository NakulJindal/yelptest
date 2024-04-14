const validHotelSchema = require("../validationSchemas/validHotel");
const validReviewSchema = require("../validationSchemas/validReviewSchema");
const ExpressError = require("../utils/ExpressError");
const zod = require("zod");

async function hotelValidate(req, res, next) {
  if (!req.body.hotel.reviews) req.body.hotel.reviews = [];
  const sanitizedHotel = validHotelSchema.safeParse(req.body);
  if (sanitizedHotel.success) {
    const { title, location, description } = sanitizedHotel.data.hotel;
    if (
      title.length === 0 ||
      location.lenght === 0 ||
      description.lenght === 0
    ) {
      next(new ExpressError("Cannot include HTML in inputs", 400));
    }
    next();
  } else {
    const message = sanitizedHotel.error.errors
      .map((err) => err.message)
      .join(", ");
    next(new ExpressError(message, 400));
  }
}

async function reviewValidate(req, res, next) {
  const sanitizedReview = validReviewSchema.safeParse(req.body);
  if (sanitizedReview.success) {
    const { comment } = sanitizedReview.data.reviews;
    if (comment.length === 0) {
      next(new ExpressError("Cannot include HTML in a Review", 400));
    }
    next();
  } else {
    console.log(error);
    const message = sanitizedReview.error.errors
      .map((err) => err.message)
      .join(", ");
    next(new ExpressError(message, 400));
  }
}

module.exports = { hotelValidate, reviewValidate };
