const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const {
  campgroundValidate,
  reviewValidate,
} = require("./middlewares/validationMiddlewares");

mongoose.connect("mongodb://localhost:27017/yelp-hotel");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected");
});

const app = express();
const PORT = 3000;

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const camp = await Campground.find({ _id: id });
    const campground = camp[0];
    res.render("campgrounds/edit", { campground });
  })
);

app.post(
  "/campgrounds",
  campgroundValidate,
  catchAsync(async (req, res) => {
    const camp = req.body.campground;

    const campground = await Campground.create({ ...camp });
    res.render("campgrounds/show", { campground });
  })
);

app.post("/campgrounds/:id/reviews", reviewValidate, async (req, res, next) => {
  const id = req.params.id;
  const { reviews } = req.body;
  const campground = await Campground.findById(id);
  const review = await Review.create({ ...reviews });
  campground.reviews.push(review);
  await campground.save();
  res.redirect(`/campgrounds/${id}`);
});

app.put(
  "/campgrounds/:id",
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

app.delete(
  "/campgrounds/:id",
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

app.delete(
  "/campgrounds/:campId/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { campId, reviewId } = req.params;

    // const campground = await Campground.findById(campId);
    // const index = campground.reviews.indexOf(reviewId);
    // campground.reviews.splice(index, 1);
    // Campground.findOneAndUpdate(
    //   { _id: campId },
    //   { ...campground },
    //   { new: true }
    // );
    await Campground.findByIdAndUpdate(campId, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campId}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found!!", 404));
});

app.use((err, req, res, next) => {
  if (!err.message) err.message = "Something Went Wrong!!";
  if (!err.statusCode) err.statusCode = 500;
  console.log(err);
  res.status(err.statusCode).render("error", { err });
});

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
