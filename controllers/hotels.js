const Hotel = require("../models/hotel");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.getAllHotels = async (req, res) => {
  const hotels = await Hotel.find({}).populate("popupText");
  res.render("hotels/index", { hotels });
};

module.exports.renderNewHotelForm = (req, res) => {
  res.render("hotels/new");
};

module.exports.getHotel = async (req, res) => {
  const id = req.params.id;
  const hotel = await Hotel.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "reviewer",
      },
    })
    .populate("author");
  if (!hotel) {
    req.flash("error", "Hotel not found!");
    return res.redirect("/hotels");
  }

  res.render("hotels/show", { hotel });
};

module.exports.renderEditHotelForm = async (req, res) => {
  const id = req.params.id;
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    req.flash("error", "Hotel not found!");
    return res.redirect("/hotels");
  }
  res.render("hotels/edit", { hotel });
};

module.exports.addNewHotel = async (req, res) => {
  const hotl = req.body.hotel;
  const author = req.user._id;
  const images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  const geoData = await geocoder
    .forwardGeocode({
      query: hotl.location,
      limit: 1,
    })
    .send();
  if (geoData.body.features.length === 0) {
    req.flash("error", "Please provide valid Location.");
    return res.redirect("/hotels/new");
  }
  const geometry = geoData.body.features[0].geometry;
  const hotel = await Hotel.create({
    ...hotl,
    author,
    images,
    geometry,
  });
  req.flash("success", "Hotel Created Successfully!");
  res.redirect(`/hotels/${hotel._id}`);
};

module.exports.updateHotel = async (req, res) => {
  const hotl = req.body.hotel;
  const id = req.params.id;
  const geoData = await geocoder
    .forwardGeocode({
      query: hotl.location,
      limit: 1,
    })
    .send();
  if (geoData.body.features.length === 0) {
    req.flash("error", "Please provide valid Location.");
    return res.redirect(`/hotels/${id}/edit`);
  }
  hotl.geometry = geoData.body.features[0].geometry;
  const hotel = await Hotel.findOneAndUpdate(
    { _id: id },
    { ...hotl },
    { new: true }
  );
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  hotel.images.push(...imgs);
  await hotel.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename);
    }
    await hotel.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Hotel Updated Successfully!");
  res.redirect(`/hotels/${id}`);
};

module.exports.deleteHotel = async (req, res) => {
  const id = req.params.id;
  const hotel = await Hotel.findById(id);
  for (let image of hotel.images) {
    cloudinary.uploader.destroy(image.filename);
  }
  await Hotel.findByIdAndDelete(id);

  // Deleting all the reviews on this hotl
  //    now this functionality is implemented using a mongoose middleware in mongoose Hotel schema
  // const hotel = await Hotel.findById(id);
  // const reviewIds = hotel.reviews;
  // await Hotel.findByIdAndDelete(id);
  // await Review.deleteMany({ _id: { $in: reviewIds } });

  req.flash("success", "Hotel Deleted Successfully!");
  res.redirect("/hotels");
};
