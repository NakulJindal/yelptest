const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const {
  campgroundValidate,
  reviewValidate,
} = require("../middlewares/validationMiddlewares");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const camp = await Campground.find({ _id: id });
    const campground = camp[0];
    res.render("campgrounds/edit", { campground });
  })
);

router.post(
  "/",
  campgroundValidate,
  catchAsync(async (req, res) => {
    const camp = req.body.campground;

    const campground = await Campground.create({ ...camp });
    res.render("campgrounds/show", { campground });
  })
);

router.put(
  "/:id",
  campgroundValidate,
  catchAsync(async (req, res) => {
    const camp = req.body.campground;
    const id = req.params.id;
    const campground = await Campground.findOneAndUpdate(
      { _id: id },
      { ...camp },
      { new: true }
    );

    res.render("campgrounds/show", { campground });
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);

    // Deleting all the reviews on this camp
    //    now this functionality is implemented using a mongoose middleware in mongoose Campground schema
    // const campground = await Campground.findById(id);
    // const reviewIds = campground.reviews;
    // await Campground.findByIdAndDelete(id);
    // await Review.deleteMany({ _id: { $in: reviewIds } });

    res.redirect("/campgrounds");
  })
);

module.exports = router;
