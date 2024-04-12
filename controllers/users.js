const User = require("../models/user");

module.exports.renderSignupForm = (req, res, next) => {
  res.render("users/register");
};

module.exports.renderLoginForm = (req, res, next) => {
  res.render("users/login");
};

module.exports.logOut = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

module.exports.signUp = async (req, res, next) => {
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
};

module.exports.logIn = (req, res, next) => {
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  req.flash("success", "Welcome Back!");
  res.redirect(redirectUrl);
};
