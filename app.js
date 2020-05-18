const express = require("express");
// use put and delete we need to install and connect:

// Connect Session and Flash
const session = require("express-session");
const flash = require("connect-flash");

var methodOverride = require("method-override");
const app = express();
const path = require("path");

// setting .env file
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
// file upload
var multer = require("multer");

//set passport and passport-local for Auth
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Connect EJS Template Engine:
app.set("view engine", "ejs");
app.set("views", "views");

//connect route with individual file
const AuthRoutes = require("./routes/admin/AuthRoutes");
const MyRoute = require("./routes/MyRoute");

// connect User model for auth
const User = require("./models/admin/UserModel");

// convert form data
const bodyPerser = require("body-parser");
app.use(bodyPerser.urlencoded({ extended: false }));

// Connect Static Files,
app.use(express.static(path.join(__dirname, "public")));

// set root directory...
global.__basedir = __dirname;

//middleware for  method override
app.use(methodOverride("_method"));
// connect all routes files

//middleware for express session
app.use(
  session({
    secret: "nodejs",
    resave: true,
    saveUninitialized: true,
  })
);

// set auth.....
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// end set auth....

//middleware for connect flash
app.use(flash());

// prevent from browser back button by caching disabled for every route
app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

//setting middlware globally
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// frontend Routes.....
// app.use(myRoutes);

// Admin Routes...
app.use("/admin", AuthRoutes);
app.use(MyRoute);

// Create 404 page
const errorControllers = require("./controllers/errorController");
app.use(errorControllers);

// Connecting to Mongo DB database( Mongoose )
mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// create PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`this server is running on ${port}`));
