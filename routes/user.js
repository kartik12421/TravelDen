const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { redirectUrl } = require("../middleware.js");

//signup
router.get("/signup", (req, res) => {
  res.render("./user/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const regUser = await User.register(newUser, password);
      req.login(regUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Sign Up Successfully");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  }),
);

//login
router.get("/login", (req, res) => {
  res.render("./user/login.ejs");
});

router.post(
  "/login",
  redirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "welcome Back to TravelDen!");
    // use the originalUrl captured in middleware or fall back to listings
    const redirect = res.locals.originalUrl || "/listings";
    // clear it so it doesn't linger in session
    delete req.session.originalUrl;
    res.redirect(redirect);
  },
);

//logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out Successfully!");
    res.redirect("/listings");
  });
});

module.exports = router;
