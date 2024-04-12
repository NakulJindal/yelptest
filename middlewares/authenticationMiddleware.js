const authenticateLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You're not Logged in, Please Log In Again!!");
    return res.redirect("/register/login");
  }
  next();
};

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports = { authenticateLogin, storeReturnTo };
