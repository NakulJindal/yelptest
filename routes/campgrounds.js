const express = require("express");
const multer = require("multer");
const { storage } = require("../cloudinary");
const campground = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { campgroundValidate } = require("../middlewares/validationMiddlewares");
const {
  authenticateLogin,
  isAuthor,
  storeReturnTo,
} = require("../middlewares/authenticationMiddleware");

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campground.getAllCampgrounds))
  .post(
    authenticateLogin,
    upload.array("image"),
    campgroundValidate,
    catchAsync(campground.addNewCampground)
  );

router.get("/new", authenticateLogin, campground.renderNewCampgroundForm);

router
  .route("/:id")
  .get(catchAsync(campground.getCampground))
  .put(
    authenticateLogin,
    isAuthor,
    upload.array("image"),
    campgroundValidate,
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
