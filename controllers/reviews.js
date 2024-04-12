const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.addNewReview = async (req, res, next) => {
  const id = req.params.id;
  const { reviews } = req.body;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  const reviewer = req.user._id;
  const review = await Review.create({ ...reviews, reviewer });
  campground.reviews.push(review);
  await campground.save();
  req.flash("success", "Review Added!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // const campground = await Campground.findById(campId);
  // const index = campground.reviews.indexOf(reviewId);
  // campground.reviews.splice(index, 1);
  // Campground.findOneAndUpdate(
  //   { _id: campId },
  //   { ...campground },
  //   { new: true }
  // );
  const campground = await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/campgrounds/${id}`);
};
