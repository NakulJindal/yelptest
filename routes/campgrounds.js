const express = require("express");
const router = express.Router();
const campground = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const {
  authenticateLogin,
  isAuthor,
} = require("../middlewares/authenticationMiddleware");
const { campgroundValidate } = require("../middlewares/validationMiddlewares");

router
  .route("/")
  .get(catchAsync(campground.getAllCampgrounds))
  .post(
    authenticateLogin,
    campgroundValidate,
    catchAsync(campground.addNewCampground)
  );

router.get("/new", authenticateLogin, campground.renderNewCampgroundForm);

router
  .route("/:id")
  .get(catchAsync(campground.getCampground))
  .put(
    authenticateLogin,
    campgroundValidate,
    isAuthor,
    catchAsync(campground.updateCampground)
  )
  .delete(authenticateLogin, isAuthor, catchAsync(campground.deleteCampground));

router.get(
  "/:id/edit",
  authenticateLogin,
  isAuthor,
  catchAsync(campground.renderEditCampgroundForm)
);

module.exports = router;
