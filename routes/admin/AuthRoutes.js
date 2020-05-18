const express = require("express");
const router = express.Router();
const AuthController = require("../../controllers/admin/AuthController");

// Set is authenticated or not
function isAuthenticatedUser(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "Please Login first to access this page.");
  res.redirect("/admin/login");
}

// again
function isAuthenticatedUser2(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  req.flash("success_msg", "you are logged now!");
  res.redirect("/admin/dashboard");
}

// End Authenticated

router.get("/dashboard", isAuthenticatedUser, AuthController.dashboard);
router.get("/login", isAuthenticatedUser2, AuthController.login);
router.post("/login", AuthController.checkUser);
router.get("/logout", isAuthenticatedUser, AuthController.logout);
router.get("/signup", isAuthenticatedUser2, AuthController.signUp);
router.post("/signup", AuthController.saveUser);
router.get(
  "/password/reset/:token",
  isAuthenticatedUser2,
  AuthController.resetPassword
);
router.post("/password/reset/:token", AuthController.saveResetPassword);
router.get(
  "/password/change",
  isAuthenticatedUser,
  AuthController.changePassword
);
router.post("/password/change", AuthController.saveChangePassword);
router.get(
  "/forgot-password",
  isAuthenticatedUser2,
  AuthController.forgotPassword
);
router.post("/forgot-password", AuthController.recoverPassword);
module.exports = router;
