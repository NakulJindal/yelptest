const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

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

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", async (req, res) => {
  const id = req.params.id;
  const camp = await Campground.find({ _id: id });
  const campground = camp[0];
  res.render("campgrounds/show", { campground });
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  const id = req.params.id;
  const camp = await Campground.find({ _id: id });
  const campground = camp[0];
  res.render("campgrounds/edit", { campground });
});

app.post("/campgrounds", async (req, res) => {
  const camp = req.body.campground;

  const campground = await Campground.create({ ...camp });
  console.log(campground);
  res.render("campgrounds/show", { campground });
});

app.put("/campgrounds/:id", async (req, res) => {
  const camp = req.body.campground;
  const id = req.params.id;
  console.log(camp);
  const campground = await Campground.findOneAndUpdate(
    { _id: id },
    { ...camp },
    { new: true }
  );

  console.log(campground);
  res.render("campgrounds/show", { campground });
});

app.delete("/campgrounds/:id", async (req, res) => {
  const id = req.params.id;
  const camp = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});