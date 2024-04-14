const Review = require("../models/review");
const Hotel = require("../models/hotel");

module.exports.addNewReview = async (req, res, next) => {
  const id = req.params.id;
  const { reviews } = req.body;
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    req.flash("error", "Hotel not found!");
    return res.redirect("/hotels");
  }
  const reviewer = req.user._id;
  const review = await Review.create({ ...reviews, reviewer });
  hotel.reviews.push(review);
  await hotel.save();
  req.flash("success", "Review Added!");
  res.redirect(`/hotels/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // const hotel = await Hotel.findById(hotelId);
  // const index = hotel.reviews.indexOf(reviewId);
  // hotel.reviews.splice(index, 1);
  // Hotel.findOneAndUpdate(
  //   { _id: hotelId },
  //   { ...hotel },
  //   { new: true }
  // );
  const hotel = await Hotel.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  if (!hotel) {
    req.flash("error", "Hotel not found!");
    return res.redirect("/hotels");
  }
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/hotels/${id}`);
};
