const Hotel = require("../models/hotel");
const Review = require("../models/review");

const authenticateLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You're not Logged in, Please Log In!!");
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
  const hotel = await Hotel.findById(id);
  if (!hotel.author.equals(req.user._id)) {
    req.flash("error", "Only Authors can Edit there Hotels!");
    return res.redirect(`/hotels/${id}`);
  }
  next();
};

const isReviewer = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.reviewer.equals(req.user._id)) {
    req.flash("error", "Only Authors can Delete there Review!");
    return res.redirect(`/hotels/${id}`);
  }
  next();
};

module.exports = { authenticateLogin, storeReturnTo, isAuthor, isReviewer };
