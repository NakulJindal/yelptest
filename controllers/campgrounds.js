const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.getAllCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({}).populate("popupText");
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
  // res.render('your-template', {  campground: yourCampgroundData });

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
  const images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  const geoData = await geocoder
    .forwardGeocode({
      query: camp.location,
      limit: 1,
    })
    .send();
  if (geoData.body.features.length === 0) {
    req.flash("error", "Please provide valid Location.");
    return res.redirect("/campgrounds/new");
  }
  const geometry = geoData.body.features[0].geometry;
  const campground = await Campground.create({
    ...camp,
    author,
    images,
    geometry,
  });
  req.flash("success", "Campground Created Successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.updateCampground = async (req, res) => {
  const camp = req.body.campground;
  const id = req.params.id;
  const geoData = await geocoder
    .forwardGeocode({
      query: camp.location,
      limit: 1,
    })
    .send();
  if (geoData.body.features.length === 0) {
    req.flash("error", "Please provide valid Location.");
    return res.redirect(`/campgrounds/${id}/edit`);
  }
  camp.geometry = geoData.body.features[0].geometry;
  const campground = await Campground.findOneAndUpdate(
    { _id: id },
    { ...camp },
    { new: true }
  );
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Campground Updated Successfully!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const id = req.params.id;
  const campground = await Campground.findById(id);
  for (let image of campground.images) {
    cloudinary.uploader.destroy(image.filename);
  }
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
