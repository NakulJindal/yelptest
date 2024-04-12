const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middlewares/authenticationMiddleware");

router.get("/", (req, res, next) => {
  res.render("users/register");
});

router.get("/login", (req, res, next) => {
  res.render("users/login");
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

router.post(
  "/",
  storeReturnTo,
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      const redirectUrl = res.locals.returnTo || "/campgrounds";
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelp!");
        res.redirect(redirectUrl);
      });
    } catch (err) {
      req.flash("error", err.message + ". Please Try Again!");
      res.redirect("/register");
    }
  })
);

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/register/login",
    failureFlash: "Something Went Wrong Please Try Again!",
  }),
  (req, res, next) => {
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    req.flash("success", "Welcome Back!");
    res.redirect(redirectUrl);
  }
);

module.exports = router;
