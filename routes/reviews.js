const express = require("express");
const router = express.Router({ mergeParams: true });
const review = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const {
  authenticateLogin,
  isReviewer,
} = require("../middlewares/authenticationMiddleware");
const { reviewValidate } = require("../middlewares/validationMiddlewares");

router.post("/", authenticateLogin, reviewValidate, review.addNewReview);

router.delete(
  "/:reviewId",
  authenticateLogin,
  isReviewer,
  catchAsync(review.deleteReview)
);

module.exports = router;
