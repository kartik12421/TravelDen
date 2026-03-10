if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// connect-mongo exports a function/class; depending on module interop the default
// export may be nested under `.default`.  Ensure we reference the correct object.
let MongoStore = require("connect-mongo");
// if imported via CommonJS and the export is default-wrapped, unwrap it
if (MongoStore && MongoStore.default) {
  MongoStore = MongoStore.default;
}

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { log } = require("console");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

//db connection establish
const dburl = process.env.DB_URL;

async function main() {
  await mongoose.connect(dburl, {
    serverSelectionTimeoutMS: 10000,
  });
}
main()
  .then(() => {
    console.log("connected to database");
    app.listen(3000, () => {
      console.log(`server is listening at http://localhost:3000/listings`);
    });
  })
  .catch((err) => {
    console.log("database connection failed:", err.message);
    if (/ssl|tls|alert number 80/i.test(err.message)) {
      console.log(
        "TLS handshake failed. Check Atlas Network Access (IP whitelist), firewall/VPN/proxy, and use a fresh Atlas driver URI."
      );
    }
    if (/whitelist|IP that isn't whitelisted/i.test(err.message)) {
      console.log(
        "Your current machine IP is not allowed in Atlas. Add it in Atlas -> Network Access."
      );
    }
    process.exit(1);
  });

//express-session
// create store using connect-mongo API
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in mongo sessio store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

//flash
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // always define the property so templates can reference it safely
  res.locals.currentStatus = req.user || null;
  next();
});

//root route
// app.get("/", (req, res) => {
//   res.send("i am groot");
// });

// app.get("/demo", async (req, res) => {
//   let demoUser = new User({
//     email: "student@gmail.com",
//     username: "Bittu",
//   });

//   let regUser = await User.register(demoUser, "helloworld");
//   res.send(regUser);
// });

//routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//err
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
  // res.status(statusCode).send(message);
});

