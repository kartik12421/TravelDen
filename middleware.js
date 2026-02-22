module.exports.isLogedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirect to original path
    req.session.originalUrl = req.originalUrl;
    //-------------------------

    req.flash("error", "You must log in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.redirectUrl = (req, res, next) => {
  if (req.session.originalUrl) {
    res.locals.originalUrl = req.session.originalUrl;
  }
  next();
};
