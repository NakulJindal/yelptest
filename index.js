const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const campRouter = require("./routes/campground");
const reviewRouter = require("./routes/reviews");
const ExpressError = require("./utils/ExpressError");

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
app.use(express.static(path.join(__dirname, "public")));

app.use("/campgrounds", campRouter);
app.use("/campgrounds/:id/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.render("home");
});

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
