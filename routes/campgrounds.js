const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const {
  authenticateLogin,
  isAuthor,
} = require("../middlewares/authenticationMiddleware");
const { campgroundValidate } = require("../middlewares/validationMiddlewares");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", authenticateLogin, (req, res) => {
  res.render("campgrounds/new");
});

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "reviewer",
        },
      })
      .populate("author");
    console.log(campground);
    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  authenticateLogin,
  isAuthor,
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.post(
  "/",
  authenticateLogin,
  campgroundValidate,
  catchAsync(async (req, res) => {
    const camp = req.body.campground;
    const author = req.user._id;
    const campground = await Campground.create({ ...camp, author });
    req.flash("success", "Campground Created Successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.put(
  "/:id",
  authenticateLogin,
  campgroundValidate,
  isAuthor,
  catchAsync(async (req, res) => {
    const camp = req.body.campground;
    const id = req.params.id;
    await Campground.findOneAndUpdate({ _id: id }, { ...camp }, { new: true });
    req.flash("success", "Campground Updated Successfully!");
    res.redirect(`campgrounds/${id}`);
  })
);

router.delete(
  "/:id",
  authenticateLogin,
  isAuthor,
  catchAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);

    // Deleting all the reviews on this camp
    //    now this functionality is implemented using a mongoose middleware in mongoose Campground schema
    // const campground = await Campground.findById(id);
    // const reviewIds = campground.reviews;
    // await Campground.findByIdAndDelete(id);
    // await Review.deleteMany({ _id: { $in: reviewIds } });

    req.flash("success", "Campground Deleted Successfully!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
