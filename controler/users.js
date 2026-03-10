const User = require("../models/user.js");

module.exports.signup = (req, res) => {
  res.render("./user/signup.ejs");
};

module.exports.postSignup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const regUser = await User.register(newUser, password);
    return req.login(regUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Sign Up Successfully");
      return res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");
  }
};

module.exports.login = (req, res) => {
  res.render("./user/login.ejs");
};

module.exports.postLogin = async (req, res) => {
  req.flash("success", "welcome Back to TravelDen!");
  // use the originalUrl captured in middleware or fall back to listings
  const redirect = res.locals.originalUrl || "/listings";
  // clear it so it doesn't linger in session
  delete req.session.originalUrl;
  res.redirect(redirect);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out Successfully!");
    res.redirect("/listings");
  });
};
