const Campground = require("../models/campground");
const Review = require("../models/review");

const authenticateLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You're not Logged in, Please Log In Again!!");
    return res.redirect("/register/login");
  }
  next();
};

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

const isAuthor = async (req, res, next) => {
  const id = req.params.id;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "Only Authors can Edit there Campgrounds!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const isReviewer = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.reviewer.equals(req.user._id)) {
    req.flash("error", "Only Authors can Delete there Review!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports = { authenticateLogin, storeReturnTo, isAuthor, isReviewer };
