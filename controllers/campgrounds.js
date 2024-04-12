const Campground = require("../models/campground");

module.exports.getAllCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewCampgroundForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.getCampground = async (req, res) => {
  const id = req.params.id;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "reviewer",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditCampgroundForm = async (req, res) => {
  const id = req.params.id;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.addNewCampground = async (req, res) => {
  const camp = req.body.campground;
  const author = req.user._id;
  const campground = await Campground.create({ ...camp, author });
  req.flash("success", "Campground Created Successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.updateCampground = async (req, res) => {
  const camp = req.body.campground;
  const id = req.params.id;
  await Campground.findOneAndUpdate({ _id: id }, { ...camp }, { new: true });
  req.flash("success", "Campground Updated Successfully!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
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
};
