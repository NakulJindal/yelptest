const express = require("express");
const router = express.Router();
const user = require("../controllers/users");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middlewares/authenticationMiddleware");

router
  .route("/")
  .get(user.renderSignupForm)
  .post(storeReturnTo, catchAsync(user.signUp));

router
  .route("/login")
  .get(user.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/register/login",
      failureFlash: "Something Went Wrong Please Try Again!",
    }),
    user.logIn
  );

router.get("/logout", user.logOut);

module.exports = router;
