const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { redirectUrl } = require("../middleware.js");

const userController = require("../controler/users.js");

//signup
router
  .route("/signup")
  .get(userController.signup)
  .post(wrapAsync(userController.postSignup));

//login
router
  .route("/login")
  .get(userController.login)
  .post(
    redirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.postLogin,
  );

//logout
router.get("/logout", userController.logout);

module.exports = router;
