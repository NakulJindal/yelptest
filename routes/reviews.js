const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { reviewValidate } = require("../middlewares/validationMiddlewares");

router.post("/", reviewValidate, async (req, res, next) => {
  const id = req.params.id;
  const { reviews } = req.body;
  const campground = await Campground.findById(id);
  const review = await Review.create({ ...reviews });
  campground.reviews.push(review);
  await campground.save();
  res.redirect(`/campgrounds/${id}`);
});

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // const campground = await Campground.findById(campId);
    // const index = campground.reviews.indexOf(reviewId);
    // campground.reviews.splice(index, 1);
    // Campground.findOneAndUpdate(
    //   { _id: campId },
    //   { ...campground },
    //   { new: true }
    // );
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
