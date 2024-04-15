if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const path = require("path");
const helmet = require("helmet");
const express = require("express");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const mongoSanitize = require("express-mongo-sanitize");
const User = require("./models/user");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const hotelRouter = require("./routes/hotels");
const ExpressError = require("./utils/ExpressError");

const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/yelp-hotel";
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected");
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const app = express();
const PORT = 3000;
const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!["/", "/register/login", "/register"].includes(req.originalUrl))
    req.session.returnTo = req.originalUrl;
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/hotels", hotelRouter);
app.use("/hotels/:id/reviews", reviewRouter);
app.use("/register", userRouter);

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
